<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Tool;
use Illuminate\Http\Request;
use App\Models\Notification;

class BookingController extends Controller
{
    /**
     * GET /api/bookings
     * Retourne les reservations où l'user est owner OU borrower
     * FIX: eager load tool.user + tool.category + review pour que le frontend
     *      puisse afficher b.tool?.user?.name ET verifier b.review
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $bookings = Booking::with([
            'tool.user',
            'tool.category',
            'borrower.reviewsReceived' => function($q) {
                $q->latest()->take(5);
            },
            'reviews',
        ])
            ->where(function ($q) use ($userId) {
                $q->where('borrower_id', $userId)
                    ->orWhereHas('tool', fn($q2) => $q2->where('user_id', $userId));
            })
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    /**
     * POST /api/bookings
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tool_id'    => 'required|exists:tools,id',
            'start_date' => 'required|date|after_or_equal:now',
            'end_date'   => 'required|date|after:start_date',
        ]);

        $tool = Tool::findOrFail($validated['tool_id']);

        // Seul un borrower peut réserver
        if ($request->user()->role !== 'borrower' || $request->user()->is_admin) {
            return response()->json(['message' => 'Seuls les emprunteurs peuvent réserver'], 403);
        }

        // Le proprietaire ne peut pas reserver son propre outil
        if ($tool->user_id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas reserver votre propre outil'], 422);
        }

        // Verification des conflits de dates (pending + approved bloquent les dates)
        $conflict = Booking::where('tool_id', $validated['tool_id'])
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($q) use ($validated) {
                $q->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                    ->orWhereBetween('end_date',  [$validated['start_date'], $validated['end_date']])
                    ->orWhere(function ($q2) use ($validated) {
                        $q2->where('start_date', '<=', $validated['start_date'])
                            ->where('end_date',   '>=', $validated['end_date']);
                    });
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Cet outil n\'est pas disponible pour les dates sélectionnées',
            ], 422);
        }

        $start = \Carbon\Carbon::parse($validated['start_date']);
        $end   = \Carbon\Carbon::parse($validated['end_date']);

        // Calcul du prix estimé (basé sur l'heure direct)
        $hours = $start->diffInMinutes($end) / 60;
        $totalPrice = round($hours * $tool->price, 2);

        $booking = Booking::create([
            'tool_id'     => $validated['tool_id'],
            'borrower_id' => $request->user()->id,
            'start_date'  => $validated['start_date'],
            'end_date'    => $validated['end_date'],
            'status'      => 'pending',
            'total_price' => $totalPrice,
        ]);

        Notification::create([
            'user_id'        => $tool->user_id,
            'type'           => 'booking_received',
            'title'          => 'Nouvelle demande reçue',
            'message'        => $request->user()->name . ' souhaite réserver votre "' . $tool->title . '".',
            'reference_id'   => $booking->id,
            'reference_type' => 'booking',
        ]);

        return response()->json([
            'message' => 'Demande de reservation envoyée',
            'booking' => $booking->load(['tool.user', 'tool.category', 'borrower']),
        ], 201);
    }

    /**
     * PUT /api/bookings/{id}/approve
     */
    public function approve(Request $request, $id)
    {
        $booking = Booking::with('tool')->findOrFail($id);



        if ($booking->tool->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'La reservation n\'est pas en attente'], 422);
        }

        // Générer code unique TAS-XXXX
        $code = 'TAS-' . strtoupper(substr(md5(uniqid()), 0, 4));

        $booking->update([
            'status'            => 'approved',
            'confirmation_code' => $code,
        ]);

        Notification::create([
            'user_id'        => $booking->borrower_id,
            'type'           => 'booking_approved',
            'title'          => 'Réservation confirmée',
            'message'        => 'Bonne nouvelle ! Votre réservation pour "' . $booking->tool->title . '" a été approuvée.',
            'reference_id'   => $booking->id,
            'reference_type' => 'booking',
        ]);

        return response()->json([
            'message' => 'Reservation approuvée',
            'booking' => $booking->load(['tool.user', 'borrower', 'reviews']),
        ]);
    }

    /**
     * PUT /api/bookings/{id}/reject
     */
    public function reject(Request $request, $id)
    {
        $booking = Booking::with('tool')->findOrFail($id);



        if ($booking->tool->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'La reservation n\'est pas en attente'], 422);
        }

        $booking->update(['status' => 'rejected']);

        Notification::create([
            'user_id'        => $booking->borrower_id,
            'type'           => 'booking_rejected',
                        'title'          => 'Réservation refusée',
            'message'        => 'Désolé, votre demande pour "' . $booking->tool->title . '" ne peut pas être satisfaite pour le moment.',
            'reference_id'   => $booking->id,
            'reference_type' => 'booking',
        ]);

        return response()->json([
            'message' => 'Reservation rejetée',
            'booking' => $booking->load(['tool.user', 'borrower', 'reviews']),
        ]);
    }
    /**
     * PUT /api/bookings/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        // Seul l'emprunteur peut annuler
        if ($booking->borrower_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Seulement si pending
        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Seules les réservations en attente peuvent être annulées'], 422);
        }

        $booking->update(['status' => 'cancelled']);

        Notification::create([
            'user_id'        => $booking->tool->user_id,
            'type'           => 'booking_cancelled',
            'title'          => 'Réservation annulée',
            'message'        => $booking->borrower->name . ' a annulé sa demande pour "' . $booking->tool->title . '".',
            'reference_id'   => $booking->id,
            'reference_type' => 'booking',
        ]);

        return response()->json([
            'message' => 'Réservation annulée',
            'booking' => $booking->load(['tool.user', 'borrower', 'reviews']),
        ]);
    }
    /**
     * POST /api/bookings/{id}/confirm-pickup
     */
    public function confirmPickup(Request $request, $id)
    {
        $request->validate(['code' => 'required|string']);

        $booking = Booking::findOrFail($id);

        if ($booking->borrower_id !== $request->user()->id)
            return response()->json(['message' => 'Non autorisé'], 403);

        if ($booking->status !== 'approved')
            return response()->json(['message' => 'La réservation doit être approuvée'], 422);

        if ($booking->picked_up_at)
            return response()->json(['message' => 'Outil déjà récupéré'], 422);

        // Vérifie le code d'emprunt (TAS-XXXX)
        if ($booking->confirmation_code !== $request->code)
            return response()->json(['message' => 'Code incorrect'], 422);

        // Génère un NOUVEAU code pour le retour (RET-XXXX)
        $returnCode = 'RET-' . strtoupper(substr(md5(uniqid()), 0, 4));

        $updateData = [
            'picked_up_at' => now(),
            'return_code'  => $returnCode,
        ];

        // AJUSTEMENT AUTOMATIQUE : Si l'utilisateur récupère l'outil AVANT la date prévue, 
        // on met à jour la date de début et on recalcule le prix total estimé.
        if (now()->lt(\Carbon\Carbon::parse($booking->start_date))) {
            $updateData['start_date'] = now();
            
            // Recalcul de la durée totale estimée (now -> end_date prévue) en mode horaire direct
            $hours = now()->diffInMinutes(\Carbon\Carbon::parse($booking->end_date)) / 60;
            $updateData['total_price'] = round($hours * $booking->tool->price, 2);
        }

        $booking->update($updateData);

        Notification::create([
            'user_id'        => $booking->tool->user_id,
            'type'           => 'tool_picked_up',
                        'title'          => 'Outil en cours d\'utilisation',
            'message'        => $booking->borrower->name . ' vient de récupérer votre "' . $booking->tool->title . '".',
            'reference_id'   => $booking->id,
            'reference_type' => 'booking',
        ]);

        return response()->json([
            'message' => 'Prise en charge confirmée — timer démarré',
            'booking' => $booking->load(['tool.user', 'borrower', 'reviews']),
        ]);
    }

    public function confirmReturn(Request $request, $id)
    {
        $request->validate(['code' => 'required|string']);

        $booking = Booking::findOrFail($id);

        if ($booking->borrower_id !== $request->user()->id)
            return response()->json(['message' => 'Non autorisé'], 403);

        if (!$booking->picked_up_at)
            return response()->json(['message' => "L'outil n'a pas encore été récupéré"], 422);

        if ($booking->returned_at)
            return response()->json(['message' => 'Outil déjà retourné'], 422);

        // Vérifie le code de RETOUR (RET-XXXX), pas confirmation_code
        if ($booking->return_code !== $request->code)
            return response()->json(['message' => 'Code incorrect'], 422);

        $start    = \Carbon\Carbon::parse($booking->picked_up_at);
        $end      = now();
        $hours    = $start->diffInMinutes($end) / 60;

        // Calcul final à l'heure direct
        $finalPrice = round($hours * $booking->tool->price, 2);

        $booking->update([
            'returned_at' => now(),
            'status'      => 'completed',
            'final_price' => $finalPrice,
        ]);
        Notification::create([
            'user_id'        => $booking->tool->user_id,
            'type'           => 'tool_returned',
            'title'          => 'Outil retourné avec succès',
            'message'        => 'Votre "' . $booking->tool->title . '" a bien été restitué. Merci pour le partage !',
            'reference_id'   => $booking->id,
            'reference_type' => 'booking',
        ]);

        // Notification pour l'emprunteur pour laisser un avis sur le proprio/outil
        Notification::create([
            'user_id'        => $booking->borrower_id,
            'type'           => 'leave_review',
            'title'          => 'Votre avis compte !',
            'message'        => 'Comment s\'est passée votre location de "' . $booking->tool->title . '" ? Laissez un avis !',
            'reference_id'   => $booking->id,
            'reference_type' => 'booking',
        ]);

        // NOUVEAU : Notification pour le propriétaire pour noter l'emprunteur
        Notification::create([
            'user_id'        => $booking->tool->user_id,
            'type'           => 'leave_review',
            'title'          => 'Évaluez votre emprunteur',
            'message'        => $booking->borrower->name . ' a rendu votre outil. Comment s\'est passée la remise ? Laissez une note !',
            'reference_id'   => $booking->id,
            'reference_type' => 'booking',
        ]);

        return response()->json([
            'message' => 'Retour confirmé — réservation terminée',
            'booking' => $booking->load(['tool.user', 'borrower', 'reviews']),
        ]);
    }
}
