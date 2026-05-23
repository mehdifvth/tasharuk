<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use Illuminate\Http\Request;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;

class ToolController extends Controller
{
    /**
     * GET /api/tools
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

        // Filtre par ville (recherche exacte ou partielle)
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Filtrage par localisation (rayon de 30km par défaut)
        if ($request->filled('lat') && $request->filled('lng')) {
            $lat = (float) $request->lat;
            $lng = (float) $request->lng;
            $radius = (float) $request->get('radius', 30);

            $query->selectRaw("*, ROUND(( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ), 1) AS distance", [$lat, $lng, $lat])
                ->having('distance', '<=', $radius)
                ->orderBy('distance');
        } else {
            $query->latest();
        }

        $perPage = min((int) $request->get('per_page', 12), 100);
        $tools = $query->paginate($perPage);

        return response()->json($tools);
    }

    /**
     * GET /api/my-tools
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
            'latitude'    => 'nullable|numeric|between:-90,90',
            'longitude'   => 'nullable|numeric|between:-180,180',
            'city'        => 'nullable|string|max:100',
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
            'latitude'    => $validated['latitude']  ?? null,
            'longitude'   => $validated['longitude'] ?? null,
            'city'        => $validated['city']      ?? null,
        ]);

        return response()->json([
            'message' => 'Outil créé avec succès',
            'tool'    => $tool->load(['user', 'category']),
        ], 201);
    }

    /**
     * PUT /api/tools/{id}
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
            'latitude'    => 'nullable|numeric|between:-90,90',
            'longitude'   => 'nullable|numeric|between:-180,180',
            'city'        => 'nullable|string|max:100',
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

        $tool->delete();

        return response()->json(['message' => 'Outil supprimé avec succès']);
    }

    /**
     * Formule Haversine — distance en km entre deux points GPS
     */
    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat / 2) ** 2 +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) ** 2;
        return round($R * 2 * atan2(sqrt($a), sqrt(1 - $a)), 1);
    }

    /**
     * Upload image vers Cloudinary
     */
    private function uploadToCloudinary($file): string
    {
        if (env('CLOUDINARY_URL')) {
            Configuration::instance(env('CLOUDINARY_URL'));
        } else {
            Configuration::instance([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key'    => env('CLOUDINARY_KEY'),
                    'api_secret' => env('CLOUDINARY_SECRET'),
                ],
                'url' => ['secure' => true],
            ]);
        }

        $uploaded = (new UploadApi())->upload($file->getPathname());
        return $uploaded['secure_url'];
    }
}
