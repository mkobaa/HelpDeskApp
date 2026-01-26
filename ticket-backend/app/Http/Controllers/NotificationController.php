<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

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
        // Prefer session-authenticated user, otherwise accept Bearer token (Sanctum)
        $user = $request->user();

        if (!$user) {
            $authHeader = $request->header('Authorization', '') ?: $request->server('HTTP_AUTHORIZATION', '');
            if (preg_match('/Bearer\s+(.+)/', $authHeader, $m)) {
                $token = $m[1];
                try {
                    $pat = PersonalAccessToken::findToken($token);
                    if ($pat) $user = $pat->tokenable;
                } catch (\Throwable $e) {
                    // ignore
                }
            }
        }

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $lastId = (int) ($request->header('Last-Event-ID') ?? 0);

        return response()->stream(function () use ($user, &$lastId) {
            set_time_limit(0);
            ignore_user_abort(true);

            // Keep the loop running until client disconnects or an error occurs
            while (!connection_aborted()) {
                try {
                    $notifications = $user->unreadNotifications()
                        ->where('id', '>', $lastId)
                        ->orderBy('id')
                        ->get();

                    if ($notifications->isNotEmpty()) {
                        foreach ($notifications as $notification) {
                            echo "id: {$notification->id}\n";
                            echo "event: notification\n";
                            echo "data: " . json_encode([
                                'id' => $notification->id,
                                'type' => $notification->type,
                                'data' => $notification->data,
                                'created_at' => $notification->created_at,
                            ]) . "\n\n";

                            $lastId = $notification->id;
                        }

                        ob_flush();
                        flush();
                    } else {
                        // send a comment heartbeat to keep connection alive per SSE spec
                        echo ": heartbeat\n\n";
                        ob_flush();
                        flush();
                    }
                } catch (\Exception $e) {
                    echo "event: error\n";
                    echo "data: " . json_encode(['message' => 'SSE stream error']) . "\n\n";
                    ob_flush();
                    flush();
                    break;
                }

                // release DB connections periodically to avoid exhausting worker resources
                try {
                    \DB::disconnect();
                } catch (\Throwable $e) {
                    // ignore DB disconnect errors
                }

                // sleep to avoid tight loop and CPU hogging
                usleep(1000000); // 1 second
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            // advise proxies not to buffer
            'X-Accel-Buffering' => 'no',
            // CORS headers for SSE - critical for cross-origin EventSource
            'Access-Control-Allow-Origin' => 'http://localhost:3000',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Expose-Headers' => 'Content-Type, Cache-Control, X-Accel-Buffering',
        ]);
    }

}
