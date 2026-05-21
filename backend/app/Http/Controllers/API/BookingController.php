<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Tool;
use Illuminate\Http\Request;

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
            'tool.user',        // FIX: charge aussi l'user du tool (proprietaire)
            'tool.category',    // FIX: charge la categorie du tool
            'borrower',         // l'emprunteur
            'review',           // FIX: charge le review pour savoir s'il existe déjà
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
            'start_date' => 'required|date|after_or_equal:today',
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

        $booking = Booking::create([
            'tool_id'     => $validated['tool_id'],
            'borrower_id' => $request->user()->id,
            'start_date'  => $validated['start_date'],
            'end_date'    => $validated['end_date'],
            'status'      => 'pending',
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

        $booking->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Reservation approuvée',
            'booking' => $booking->load(['tool.user', 'borrower', 'review']),
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

        return response()->json([
            'message' => 'Reservation rejetée',
            'booking' => $booking->load(['tool.user', 'borrower', 'review']),
        ]);
    }
}
