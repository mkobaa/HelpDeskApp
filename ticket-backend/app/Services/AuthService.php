<?php

namespace App\Services;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;


class AuthService
{
    public static function authenticate(Request $request)
    {
        $user = User::where('email', $request->email)->first();
        
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }
        return $user;
    }

    public static function checkUserStatus(User $user)
    {
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account is deactivated. Please contact the administrator.'
            ], 403);
        }
    }

    public static function generateToken(User $user)
    {
        $user->tokens()->where('name', 'api-token')->delete();
        return $user->createToken('api-token')->plainTextToken;
    }

}
