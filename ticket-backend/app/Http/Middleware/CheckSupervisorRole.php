<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSupervisorRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== 'supervisor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Supervisor access required.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
