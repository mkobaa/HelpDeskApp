<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;

class NotificationStreamService
{
    public function stream($user, & $lastTime)
    {
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

        // Send initial unread notifications once (DB used only for persistence + initial fetch)
        try {
            $query = $user->unreadNotifications();

            if ($lastTime && is_numeric($lastTime)) {
                $query->where('created_at', '>', \Carbon\Carbon::createFromTimestamp((int) $lastTime));
            }

            $notifications = $query->orderBy('created_at')->get();

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
            }
        } catch (\Throwable $e) {
            // If initial DB fetch fails, continue to Redis subscription for realtime updates
        }

        // Subscribe to Redis Pub/Sub for realtime notifications
        $channel = sprintf('notifications:%s', $user->id);

        try {
            Redis::subscribe([$channel], function ($message) {
                if (connection_aborted()) {
                    // Let the subscribe call end when connection is gone
                    exit;
                }

                $payload = $message;

                if (is_array($message) && isset($message['payload'])) {
                    $payload = $message['payload'];
                }

                echo "event: notification\n";
                echo "data: {$payload}\n\n";
                flush();
            });
        } catch (\Throwable $e) {
            echo "event: error\n";
            echo "data: " . json_encode(['message' => 'Redis subscribe failed']) . "\n\n";
            flush();
        }
    }
}
