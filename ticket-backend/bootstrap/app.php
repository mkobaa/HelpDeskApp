<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use App\Http\Middleware\CheckUserRole;
use App\Http\Middleware\CheckSupervisorRole;
use App\Http\Middleware\CheckTechnicianRole;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        $middleware->validateCsrfTokens(except: [
            '/*'
        ]);


        // Middleware aliases
        $middleware->alias([
            'admin' => CheckUserRole::class,
            'supervisor' => CheckSupervisorRole::class,
            'technician' => CheckTechnicianRole::class,
            'cors' => \App\Http\Middleware\Cors::class,
        ]);
        
        // Apply CORS to API routes
        $middleware->api(append: [
            \App\Http\Middleware\Cors::class,
        ]);
        
        // Apply CORS to web routes
        $middleware->web(append: [
            \App\Http\Middleware\Cors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $e, $request) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        });
    })->create();
