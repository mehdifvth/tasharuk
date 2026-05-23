<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::withCount(['tools' => function ($query) {
            $query->whereNull('deleted_at');
        }])->get());
    }
}
