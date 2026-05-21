<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ToolController;
use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes — Tasharuk Platform
|--------------------------------------------------------------------------
*/


// ─── Auth (Public) ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ─── Public ───────────────────────────────────────────────────────────────────
Route::get('/tools',                    [ToolController::class, 'index']);
Route::get('/tools/{id}',              [ToolController::class, 'show']);
Route::get('/tools/{id}/reviews',      [ReviewController::class, 'toolReviews']);
Route::get('/categories',              [CategoryController::class, 'index']);

// ─── Protected (Sanctum) ──────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user',         [AuthController::class, 'me']);

    // Tools (CRUD)
    Route::get('/my-tools',          [ToolController::class, 'myTools']);   // FIX: route dédiée mes outils
    Route::post('/tools',            [ToolController::class, 'store']);
    Route::post('/tools/{id}',       [ToolController::class, 'update']);    // FIX: POST+_method=PUT ou PUT direct
    Route::put('/tools/{id}',        [ToolController::class, 'update']);    // garde PUT aussi pour compatibilité
    Route::delete('/tools/{id}',     [ToolController::class, 'destroy']);

    // Bookings
    Route::post('/bookings',                    [BookingController::class, 'store']);
    Route::get('/bookings',                     [BookingController::class, 'index']);
    Route::put('/bookings/{id}/approve',        [BookingController::class, 'approve']);
    Route::put('/bookings/{id}/reject',         [BookingController::class, 'reject']);

    // Messages
    Route::get('/messages',  [MessageController::class, 'index']);  // ?booking_id=1
    Route::post('/messages', [MessageController::class, 'store']);

    // Reviews
    Route::post('/reviews',  [ReviewController::class, 'store']);

    // Admin Data
    Route::get('/admin/data',             [AdminController::class, 'index']);
    Route::delete('/admin/users/{id}',    [AdminController::class, 'deleteUser']);
    Route::delete('/admin/tools/{id}',    [AdminController::class, 'deleteTool']);
    Route::post('/admin/categories',      [AdminController::class, 'storeCategory']);
    Route::put('/admin/categories/{id}',    [AdminController::class, 'updateCategory']);
    Route::delete('/admin/categories/{id}', [AdminController::class, 'deleteCategory']);

    Route::put('/user/role', [AuthController::class, 'updateRole']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::post('/bookings/{id}/confirm-pickup', [BookingController::class, 'confirmPickup']);
    Route::post('/bookings/{id}/confirm-return', [BookingController::class, 'confirmReturn']);
});
