<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AuthService;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = AuthService::authenticate($request);
        if (AuthService::checkUserStatus($user)) {
            return AuthService::checkUserStatus($user);
        }
        $token = AuthService::generateToken($user);


        return response()->json([
            'message' => 'Login successful!',
            'role' => $user->role,
            'token' => $token,
        ]);
    }



    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully!',
        ]);
    }

    public function check(Request $request)
    {
        return response()->json([], 200);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'is_active' => $request->user()->is_active,
            'data' => $request->user(),
        ]);
    }
    
}
