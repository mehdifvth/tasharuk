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
     * Get overview stats and data for admin
     */
    public function index(Request $request)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'users'      => User::withTrashed()->orderBy('created_at', 'desc')->get(),
            'tools'      => Tool::withTrashed()->with(['user', 'category'])->orderBy('created_at', 'desc')->get(),
            'categories' => Category::withCount('tools')->get(),
            'bookings'   => Booking::with(['tool', 'borrower'])->orderBy('created_at', 'desc')->get(),
            'reviews'    => Review::with(['reviewer', 'reviewee', 'booking.tool'])->latest()->get(),
        ]);
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
