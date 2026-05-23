<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Cloudinary\Cloudinary as CloudinaryClient;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;

class ToolController extends Controller
{
    /**
     * GET /api/tools
     * Liste publique paginée avec filtres keyword + category
     */
    public function index(Request $request)
    {
        $query = Tool::with(['user', 'category'])
            ->whereDoesntHave('bookings', function ($q) {
                $q->where('status', 'approved')
                    ->whereNotNull('picked_up_at')
                    ->whereNull('returned_at');
            });

        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->keyword . '%')
                    ->orWhere('description', 'like', '%' . $request->keyword . '%');
            });
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        // FIX: per_page configurable (défaut 12, max 100)
        // Permet au frontend de récupérer plus d'outils si besoin
        $perPage = min((int) $request->get('per_page', 12), 100);
        $tools   = $query->latest()->paginate($perPage);

        return response()->json($tools);
    }

    /**
     * GET /api/my-tools   (route protégée)
     * FIX: Retourne TOUS les outils du user connecté sans pagination
     *      Evite le problème de paginate(12) côté frontend
     */
    public function myTools(Request $request)
    {
        $tools = Tool::with(['user', 'category'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($tools);
    }

    /**
     * GET /api/tools/{id}
     */
    public function show($id)
    {
        $tool = Tool::with(['user', 'category'])->findOrFail($id);
        return response()->json($tool);
    }

    /**
     * POST /api/tools
     */
    public function store(Request $request)
    {

        if ($request->user()->role !== 'owner' || $request->user()->is_admin) {
            return response()->json(['message' => 'Accès réservé aux propriétaires'], 403);
        }
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'condition'   => 'required|in:new,good,fair',
            'price'       => 'required|numeric|min:0',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $this->uploadToCloudinary($request->file('image'));
        }

        $tool = Tool::create([
            'user_id'     => $request->user()->id,
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'condition'   => $validated['condition'],
            'price'       => $validated['price'],
            'image'       => $imagePath,
        ]);

        return response()->json([
            'message' => 'Outil créé avec succès',
            'tool'    => $tool->load(['user', 'category']),
        ], 201);
    }

    /**
     * PUT /api/tools/{id}
     * FIX: Accepte aussi POST avec _method=PUT (method spoofing Laravel)
     */
    public function update(Request $request, $id)
    {
        $tool = Tool::findOrFail($id);

        if ($tool->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'condition'   => 'sometimes|required|in:new,good,fair',
            'price'       => 'sometimes|required|numeric|min:0',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->uploadToCloudinary($request->file('image'));
        }
        $tool->update($validated);

        return response()->json([
            'message' => 'Outil mis à jour',
            'tool'    => $tool->load(['user', 'category']),
        ]);
    }

    /**
     * DELETE /api/tools/{id}
     */
    public function destroy(Request $request, $id)
    {
        $tool = Tool::findOrFail($id);

        if ($tool->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // On ne supprime pas l'image physiquement pour garder l'historique des réservations
        // if ($tool->image) {
        //     Storage::disk('public')->delete($tool->image);
        // }

        $tool->delete();

        return response()->json(['message' => 'Outil supprimé avec succès']);
    }
    private function uploadToCloudinary($file): string
    {
        // Initialisation de la config : Priorité à CLOUDINARY_URL s'il est présent
        if (env('CLOUDINARY_URL')) {
            Configuration::instance(env('CLOUDINARY_URL'));
        } else {
            Configuration::instance([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key'    => env('CLOUDINARY_KEY'),
                    'api_secret' => env('CLOUDINARY_SECRET'),
                ],
                'url' => ['secure' => true]
            ]);
        }

        $uploaded = (new UploadApi())->upload($file->getPathname());
        return $uploaded['secure_url'];
    }
}
