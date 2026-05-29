<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tool;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role'     => 'required|in:owner,borrower',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => strtolower($validated['email']),
            'password' => $validated['password'],
            'is_admin' => false,
            'role'     => $validated['role'],
        ]);

        $token = $user->createToken('tasharuk-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', strtolower($request->email))->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('tasharuk-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * GET /api/user
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * GET /api/users/{id}/profile
     * Retourne les données publiques d'un utilisateur (outils + avis séparés)
     */
    public function publicProfile($id)
    {
        $user = User::findOrFail($id);

        // Outils actifs
        $tools = Tool::where('user_id', $id)
            ->whereNull('deleted_at')
            ->with('category')
            ->latest()
            ->get();

        // Avis reçus EN TANT QUE PROPRIÉTAIRE (par des emprunteurs)
        $ownerReviews = Review::with('reviewer')
            ->where('reviewee_id', $id)
            ->whereHas('booking.tool', fn($q) => $q->where('user_id', $id))
            ->latest()
            ->get();

        // Avis reçus EN TANT QU'EMPRUNTEUR (par des propriétaires)
        $borrowerReviews = Review::with('reviewer')
            ->where('reviewee_id', $id)
            ->whereHas('booking', fn($q) => $q->where('borrower_id', $id))
            ->latest()
            ->get();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'owner_rating' => $user->owner_rating,
                'owner_reviews_count' => $user->owner_reviews_count,
                'borrower_rating' => $user->borrower_rating,
                'borrower_reviews_count' => $user->borrower_reviews_count,
                'created_at' => $user->created_at,
            ],
            'tools' => $tools,
            'reviews' => [
                'as_owner' => $ownerReviews,
                'as_borrower' => $borrowerReviews
            ]
        ]);
    }

    public function updateRole(Request $request)
    {
        $request->validate([
            'role' => 'required|in:owner,borrower',
        ]);

        $user = $request->user();

        if ($user->is_admin) {
            return response()->json(['message' => 'Les administrateurs ne peuvent pas changer de rôle'], 403);
        }

        $user->update(['role' => $request->role]);

        return response()->json([
            'message' => 'Rôle mis à jour avec succès',
            'user'    => $user,
        ]);
    }

    /**
     * PUT /api/user/password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Mot de passe actuel incorrect.'
            ], 422);
        }

        $user->update([
            'password' => $request->password
        ]);

        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès.'
        ]);
    }

    /**
     * DELETE /api/user
     */
    public function destroy(Request $request)
    {
        $user = $request->user();
        
        if ($user->is_admin) {
            return response()->json(['message' => 'Les administrateurs ne peuvent pas être supprimés via cette route'], 403);
        }

        // Renommer l'email pour libérer l'adresse d'origine pour une future inscription
        // tout en gardant la trace pour l'admin dashboard.
        $oldEmail = $user->email;
        $user->email = 'deleted_' . time() . '_' . $oldEmail;
        $user->save();

        // Supprimer ses tokens avant la suppression du compte
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Compte supprimé avec succès']);
    }
}
