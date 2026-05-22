<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // GET /api/notifications
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->take(20)
            ->get();

        $unread = $notifications->where('is_read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unread'        => $unread,
        ]);
    }

    // PUT /api/notifications/read
    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Notifications marquées comme lues']);
    }

    // PUT /api/notifications/{id}/read
    public function markRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification lue']);
    }
}
