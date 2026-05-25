<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tool;
use App\Models\Category;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get overview stats and recent data for dashboard
     */
    public function index(Request $request)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'counts' => [
                'users'      => User::count(),
                'tools'      => Tool::whereNull('deleted_at')->count(),
                'bookings'   => Booking::count(),
                'reviews'    => Review::count(),
            ],
            'recent_users' => User::latest()->take(5)->get(),
            'recent_tools' => Tool::with(['user', 'category'])->latest()->take(5)->get(),
            'recent_bookings' => Booking::with(['tool', 'borrower'])->latest()->take(5)->get(),
            'categories' => Category::withCount('tools')->get(),
        ]);
    }

    /**
     * GET /api/admin/users
     */
    public function users(Request $request)
    {
        if (!$request->user()->is_admin) return response()->json(['message' => 'Unauthorized'], 403);

        $users = User::withTrashed()
            ->withCount([
                'reviewsReceived as owner_reviews_received_count' => fn($q) => $q->whereHas('booking.tool', fn($t) => $t->whereColumn('user_id', 'users.id')),
                'reviewsReceived as borrower_reviews_received_count' => fn($q) => $q->whereHas('booking', fn($b) => $b->whereColumn('borrower_id', 'users.id'))
            ])
            ->withAvg([
                'reviewsReceived as owner_rating_avg' => fn($q) => $q->whereHas('booking.tool', fn($t) => $t->whereColumn('user_id', 'users.id')),
                'reviewsReceived as borrower_rating_avg' => fn($q) => $q->whereHas('booking', fn($b) => $b->whereColumn('borrower_id', 'users.id'))
            ], 'rating')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($users);
    }

    /**
     * GET /api/admin/tools
     */
    public function tools(Request $request)
    {
        if (!$request->user()->is_admin) return response()->json(['message' => 'Unauthorized'], 403);

        $tools = Tool::withTrashed()
            ->with(['user', 'category'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($tools);
    }

    /**
     * GET /api/admin/bookings
     */
    public function bookings(Request $request)
    {
        if (!$request->user()->is_admin) return response()->json(['message' => 'Unauthorized'], 403);

        $query = Booking::with(['tool', 'borrower']);

        if ($request->filled('status')) {
            $status = $request->status;
            if ($status === 'cancelled') {
                $query->whereIn('status', ['rejected', 'cancelled']);
            } else {
                $query->where('status', $status);
            }
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($bookings);
    }

    /**
     * GET /api/admin/reviews
     */
    public function reviews(Request $request)
    {
        if (!$request->user()->is_admin) return response()->json(['message' => 'Unauthorized'], 403);

        $reviews = Review::with(['reviewer', 'reviewee', 'booking.tool'])
            ->latest()
            ->paginate(20);

        return response()->json($reviews);
    }

    /**
     * Delete a user
     */
    public function deleteUser(Request $request, $id)
    {
        if (!$request->user()->is_admin) return response()->json(['message' => 'Unauthorized'], 403);

        $user = User::findOrFail($id);
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete yourself'], 400);
        }

        // Renommer l'email pour libérer l'adresse d'origine
        $oldEmail = $user->email;
        $user->email = 'deleted_' . time() . '_' . $oldEmail;
        $user->save();

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Restore a soft-deleted user
     */
    public function restoreUser(Request $request, $id)
    {
        if (!$request->user()->is_admin) return response()->json(['message' => 'Unauthorized'], 403);

        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json(['message' => 'Utilisateur restauré avec succès']);
    }

    /**
     * Delete a tool
     */
    public function deleteTool(Request $request, $id)
    {
        if (!$request->user()->is_admin) return response()->json(['message' => 'Unauthorized'], 403);

        $tool = Tool::findOrFail($id);
        $tool->delete();
        return response()->json(['message' => 'Tool deleted successfully']);
    }

    /**
     * Delete a review
     */
    public function deleteReview(Request $request, $id)
    {
        if (!$request->user()->is_admin) return response()->json(['message' => 'Unauthorized'], 403);

        $review = Review::findOrFail($id);
        $review->delete();
        return response()->json(['message' => 'Avis supprimé avec succès']);
    }

    /**
     * Store a new category
     */
    public function storeCategory(Request $request)
    {
        if (!$request->user()->is_admin) return response()->json(['message' => 'Unauthorized'], 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
        ]);

        return response()->json($category, 201);
    }
    public function updateCategory(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|unique:categories,name,' . $id]);
        $category = Category::findOrFail($id);
        $category->update(['name' => $request->name]);
        return response()->json(['message' => 'Catégorie mise à jour', 'category' => $category]);
    }

    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);
        if ($category->tools()->count() > 0) {
            return response()->json(['message' => 'Impossible — cette catégorie contient des outils'], 422);
        }
        $category->delete();
        return response()->json(['message' => 'Catégorie supprimée']);
    }
}
