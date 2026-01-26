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

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $lastTime = $request->header('Last-Event-ID');

        return response()->stream(function () use ($user, &$lastTime) {

            while (ob_get_level() > 0) {
                ob_end_flush();
            }

            ob_implicit_flush(true);
            ini_set('output_buffering', 'off');
            ini_set('zlib.output_compression', 'off');
            set_time_limit(0);
            ignore_user_abort(true);

            echo "event: connected\n";
            echo "data: ok\n\n";
            flush();

            while (!connection_aborted()) {
                try {
                    $query = $user->unreadNotifications();

                    if ($lastTime && is_numeric($lastTime)) {
                        $query->where('created_at', '>', \Carbon\Carbon::createFromTimestamp((int) $lastTime));
                    }

                    $notifications = $query
                        ->orderBy('created_at')
                        ->get();

                    if ($notifications->isNotEmpty()) {
                        foreach ($notifications as $notification) {
                            $id = $notification->created_at->timestamp;

                            echo "id: {$id}\n";
                            echo "event: notification\n";
                            echo "data: " . json_encode([
                                'id' => $notification->id,
                                'type' => $notification->type,
                                'data' => $notification->data,
                                'created_at' => $notification->created_at,
                            ]) . "\n\n";

                            $lastTime = $id;
                        }

                        flush();
                    } else {
                        echo ": heartbeat\n\n";
                        flush();
                    }
                } catch (\Throwable $e) {
                    echo "event: error\n";
                    echo "data: " . json_encode(['message' => 'SSE stream error']) . "\n\n";
                    flush();
                    break;
                }

                try {
                    \DB::disconnect();
                } catch (\Throwable $e) {}

                usleep(1000000);
            }
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
