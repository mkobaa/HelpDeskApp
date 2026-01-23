<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTechnicianRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== 'technician') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Technician access required.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
