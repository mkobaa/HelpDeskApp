<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    public function index()
    {
        $users = User::all();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? null,
            'department' => $data['department'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => $user,
        ], 201);
    }

    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'username' => ['sometimes', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'string', 'min:8'],
            'role' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'data' => $user->fresh(),
        ]);
    }

    public function activate(User $user)
    {
        $user->is_active = true;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User activated successfully.',
            'data' => $user
        ]);
    }

    public function deactivate(User $user)
    {
        $user->is_active = false;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User deactivated successfully.',
            'data' => $user
        ]);
    }

    public function getAccountStatus(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'is_active' => $user->is_active
            ]
        ]);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }

    public function getTechnicians()
    {
        $technicians = User::where('role', 'technician')->get();

        return response()->json([
            'success' => true,
            'data' => $technicians
        ]);
    }

    public function getTechnician(User $user)
    {
        if ($user->role !== 'technician') {
            return response()->json([
                'success' => false,
                'message' => 'Technician not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

}
