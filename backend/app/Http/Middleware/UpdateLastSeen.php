<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastSeen
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            
            // Only update if last_seen_at is older than 1 minute to save DB performance
            if (!$user->last_seen_at || $user->last_seen_at->lt(now()->subMinute())) {
                $user->update(['last_seen_at' => now()]);
            }
        }

        return $next($request);
    }
}
