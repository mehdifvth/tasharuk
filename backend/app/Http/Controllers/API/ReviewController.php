<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Notification;
use App\Models\Tool;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * POST /api/reviews
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'nullable|string|max:500',
        ]);

        $booking = Booking::with('tool')->findOrFail($validated['booking_id']);
        $userId  = $request->user()->id;

        // Déterminer qui note qui
        $isBorrower = ($userId === $booking->borrower_id);
        $isOwner    = ($userId === $booking->tool->user_id);

        if (!$isBorrower && !$isOwner) {
            return response()->json(['message' => 'Non autorisé à laisser un avis pour cette réservation'], 403);
        }

        // Cible de l'avis
        $revieweeId = $isBorrower ? $booking->tool->user_id : $booking->borrower_id;

        // Uniquement pour les réservations terminées
        if ($booking->status !== 'completed') {
            return response()->json(['message' => 'La réservation doit être terminée avant de laisser un avis'], 422);
        }

        // Un seul avis par utilisateur par réservation
        if (Review::where('booking_id', $booking->id)->where('reviewer_id', $userId)->exists()) {
            return response()->json(['message' => 'Vous avez déjà laissé un avis pour cette réservation'], 422);
        }

        $review = Review::create([
            'booking_id'  => $validated['booking_id'],
            'reviewer_id' => $userId,
            'reviewee_id' => $revieweeId,
            'rating'      => $validated['rating'],
            'comment'     => $validated['comment'] ?? null,
        ]);

        // Notifier la personne notée
        Notification::create([
            'user_id'        => $revieweeId,
            'type'           => 'new_review',
            'title'          => 'Nouvel avis reçu',
            'message'        => $request->user()->name . ' a laissé un avis de ' . $validated['rating'] . '/5 à votre égard.',
            'reference_id'   => $booking->id,
            'reference_type' => 'booking',
        ]);

        return response()->json([
            'message' => 'Avis enregistré avec succès',
            'review'  => $review->load('reviewer'),
        ], 201);
    }

    /**
     * GET /api/tools/{id}/reviews
     * Avis publics sur un outil spécifique (toujours borrower -> owner/tool)
     */
    public function toolReviews($toolId)
    {
        $tool = Tool::findOrFail($toolId);

        $reviews = Review::with('reviewer')
            ->whereHas('booking', fn($q) => $q->where('tool_id', $toolId))
            ->where('reviewee_id', $tool->user_id)
            ->latest()
            ->get();

        $average = $reviews->avg('rating');

        return response()->json([
            'average_rating' => $average ? round($average, 1) : null,
            'total'          => $reviews->count(),
            'reviews'        => $reviews,
        ]);
    }
}
