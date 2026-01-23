<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TimeTracking;

class TimeTrackingService
{
    /**
     * Create time tracking when ticket is created
     */
    public static function startForTicket(Ticket $ticket)
    {
        return TimeTracking::create([
            'ticket_id' => $ticket->id,
            'start_time' => $ticket->created_at,
        ]);
    }

    /**
     * Stop time tracking when ticket is closed
     */
    public static function stopForTicket(Ticket $ticket, int $technicianId)
    {
        $tracking = $ticket->timeTracking;

        // If no tracking row exists (maybe creation was skipped), create one
        if (! $tracking) {
            $startTime = $ticket->created_at ?? now();
            $tracking = TimeTracking::create([
                'ticket_id' => $ticket->id,
                'start_time' => $startTime,
            ]);
        }

        if ($tracking->end_time !== null) {
            return $tracking; // already closed
        }

        $endTime = now();
        try {
            $seconds = $tracking->start_time->diffInSeconds($endTime);
            $minutes = (int) round($seconds / 60);
        } catch (\Throwable $e) {
            $minutes = null;
        }

        $tracking->end_time = $endTime;
        $tracking->total_time_minutes = $minutes;
        $tracking->technician_id = $technicianId;
        $tracking->save();

        return $tracking;
    }
}
