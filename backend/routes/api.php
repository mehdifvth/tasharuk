<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ToolController;
use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\AdminController;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use App\Http\Controllers\API\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes — Tasharuk Platform
|--------------------------------------------------------------------------
*/


Route::get('/ping', fn() => response()->json(['status' => 'ok']));

// ─── Auth (Public) ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ─── Public ───────────────────────────────────────────────────────────────────
Route::get('/tools',                    [ToolController::class, 'index']);
Route::get('/tools/{id}',              [ToolController::class, 'show']);
Route::get('/users/{id}/profile',      [AuthController::class, 'publicProfile']);
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
    Route::get('/admin/users',            [AdminController::class, 'users']);
    Route::get('/admin/tools',            [AdminController::class, 'tools']);
    Route::get('/admin/bookings',         [AdminController::class, 'bookings']);
    Route::put('/admin/bookings/{id}/cancel', [AdminController::class, 'cancelBooking']);
    Route::get('/admin/reviews',          [AdminController::class, 'reviews']);

    Route::delete('/admin/users/{id}',    [AdminController::class, 'deleteUser']);
    Route::post('/admin/users/{id}/restore', [AdminController::class, 'restoreUser']);
    Route::delete('/admin/tools/{id}',    [AdminController::class, 'deleteTool']);
    Route::delete('/admin/reviews/{id}',  [AdminController::class, 'deleteReview']);
    Route::post('/admin/categories',      [AdminController::class, 'storeCategory']);
    Route::put('/admin/categories/{id}',    [AdminController::class, 'updateCategory']);
    Route::delete('/admin/categories/{id}', [AdminController::class, 'deleteCategory']);

    Route::put('/user/role', [AuthController::class, 'updateRole']);
    Route::delete('/user',   [AuthController::class, 'destroy']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::post('/bookings/{id}/confirm-pickup', [BookingController::class, 'confirmPickup']);
    Route::post('/bookings/{id}/confirm-return', [BookingController::class, 'confirmReturn']);

    Route::get('/notifications',          [NotificationController::class, 'index']);
    Route::put('/notifications/read',     [NotificationController::class, 'markAllRead']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);
});
