<?php

namespace App\Services;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class SseAuthResolver
{
    public function resolve(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            $token = $request->query('token');

            if ($token) {
                try {
                    $pat = PersonalAccessToken::findToken($token);
                    if ($pat) {
                        $user = $pat->tokenable;
                    }
                } catch (\Throwable $e) {}
            }
        }

        if (!$user) {
            $authHeader = $request->header('Authorization', '') ?: $request->server('HTTP_AUTHORIZATION', '');
            if (preg_match('/Bearer\s+(.+)/', $authHeader, $m)) {
                try {
                    $pat = PersonalAccessToken::findToken($m[1]);
                    if ($pat) {
                        $user = $pat->tokenable;
                    }
                } catch (\Throwable $e) {}
            }
        }

        return $user;
    }
}
