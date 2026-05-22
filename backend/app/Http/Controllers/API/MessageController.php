<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Models\Notification;

class MessageController extends Controller
{
    /**
     * GET /api/messages?booking_id=1
     */
    public function index(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::with('tool')->findOrFail($request->booking_id);
        $userId  = $request->user()->id;

        // Only owner or borrower can read messages
        if ($userId !== $booking->borrower_id && $userId !== $booking->tool->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = Message::with('sender')
            ->where('booking_id', $request->booking_id)
            ->orderBy('created_at')
            ->get();

        return response()->json($messages);
    }

    /**
     * POST /api/messages
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'message'    => 'required|string|max:1000',
        ]);

        $booking = Booking::with('tool')->findOrFail($validated['booking_id']);
        $userId  = $request->user()->id;

        // Only owner or borrower can send messages
        if ($userId !== $booking->borrower_id && $userId !== $booking->tool->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $msg = Message::create([
            'booking_id' => $validated['booking_id'],
            'sender_id'  => $userId,
            'message'    => $validated['message'],
        ]);

        $recipientId = $userId === $booking->borrower_id
            ? $booking->tool->user_id
            : $booking->borrower_id;

        Notification::create([
            'user_id'        => $recipientId,
            'type'           => 'new_message',
            'title'          => 'Nouveau message 💬',
            'message'        => $request->user()->name . ' vous a envoyé un message pour "' . $booking->tool->title . '"',
            'reference_id'   => $validated['booking_id'],
            'reference_type' => 'booking',
        ]);

        return response()->json([
            'message' => 'Message sent',
            'data'    => $msg->load('sender'),
        ], 201);
    }
}
