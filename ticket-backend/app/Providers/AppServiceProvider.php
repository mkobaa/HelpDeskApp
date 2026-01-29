<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Redis;
use Illuminate\Notifications\DatabaseNotification;

class AppServiceProvider extends ServiceProvider
{

    public function register(): void
    {
        //
    }


    public function boot(): void
    {
        DatabaseNotification::created(function (DatabaseNotification $notification) {
            try {
                $payload = [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'created_at' => $notification->created_at?->toDateTimeString(),
                ];

                $channel = sprintf('notifications:%s', $notification->notifiable_id);
                Redis::publish($channel, json_encode($payload));
            } catch (\Throwable $e) {
            }
        });
    }
}
