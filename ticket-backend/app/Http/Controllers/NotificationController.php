<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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

        $lastId = 0;

        return response()->stream(function () use ($user, &$lastId) {
            while (true) {
                $notifications = $user->unreadNotifications()
                    ->where('id', '>', $lastId)
                    ->orderBy('id')
                    ->get();

                foreach ($notifications as $notification) {
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

                usleep(500000); // 0.5 second
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }

}
