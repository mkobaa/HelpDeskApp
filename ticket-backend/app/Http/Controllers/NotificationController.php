<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Redis;
use App\Services\SseAuthResolver;
use App\Services\NotificationStreamService;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->notifications()->latest()->get()
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }


    public function sseNotifications(Request $request)
    {
        $user = (new SseAuthResolver())->resolve($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $lastTime = $request->header('Last-Event-ID');

        return response()->stream(function () use ($user, &$lastTime) {
            (new NotificationStreamService())->stream($user, $lastTime);

        }, 200, [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache',
                'Connection' => 'keep-alive',
                'X-Accel-Buffering' => 'no',
                'Access-Control-Allow-Origin' => 'http://localhost:3000',
                'Access-Control-Allow-Methods' => 'GET, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Last-Event-ID',
            ]);
        }

    }
