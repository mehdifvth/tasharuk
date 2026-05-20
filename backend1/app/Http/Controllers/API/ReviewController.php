<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
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

        // Only borrower can leave a review
        if ($userId !== $booking->borrower_id) {
            return response()->json(['message' => 'Only the borrower can leave a review'], 403);
        }

        // Only completed bookings
        if ($booking->status !== 'completed') {
            return response()->json(['message' => 'Booking must be completed before reviewing'], 422);
        }

        // One review per booking
        if (Review::where('booking_id', $booking->id)->exists()) {
            return response()->json(['message' => 'You have already reviewed this booking'], 422);
        }

        $review = Review::create([
            'booking_id'  => $validated['booking_id'],
            'reviewer_id' => $userId,
            'rating'      => $validated['rating'],
            'comment'     => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'review'  => $review->load('reviewer'),
        ], 201);
    }

    /**
     * GET /api/tools/{id}/reviews
     */
    public function toolReviews($toolId)
    {
        $reviews = Review::with('reviewer')
            ->whereHas('booking', fn($q) => $q->where('tool_id', $toolId))
            ->latest()
            ->get();

        $average = $reviews->avg('rating');

        return response()->json([
            'average_rating' => round($average, 1),
            'total'          => $reviews->count(),
            'reviews'        => $reviews,
        ]);
    }
}
