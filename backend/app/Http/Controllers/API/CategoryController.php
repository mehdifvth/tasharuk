<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::withCount(['tools' => function ($query) {
            $query->whereNull('deleted_at')
                  ->whereDoesntHave('bookings', function ($q) {
                      $q->where('status', 'approved')
                        ->whereNotNull('picked_up_at')
                        ->whereNull('returned_at');
                  });
        }])->get());
    }
}
