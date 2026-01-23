<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\User;
use App\Models\Survey;
use App\Services\SurveyService;

class TicketService
{
    protected TimeTrackingService $timeTrackingService;

    public function __construct(TimeTrackingService $timeTrackingService)
    {
        $this->timeTrackingService = $timeTrackingService;
    }

    public function changeStatus(Ticket $ticket, string $newStatus, int $actorId): Ticket
    {
        $oldStatus = $ticket->status;

        // 1. Update status
        $ticket->status = $newStatus;
        $ticket->save();

        // 2. Notify submitter
        $this->notifySubmitter($ticket);

        // 3. Log history
        $this->logStatusChange($ticket, $oldStatus, $newStatus, $actorId);

        // 4. If closed → call YOUR service here
        if ($newStatus === 'closed') {
            $this->timeTrackingService->stopForTicket($ticket, $actorId);

            // mark ticket as survey requested
            app(SurveyService::class)->requestSurveyForTicket($ticket);

            // create a placeholder Survey row if none exists (use neutral defaults)
            if (! Survey::where('ticket_id', $ticket->id)->exists()) {
                Survey::create([
                    'ticket_id' => $ticket->id,
                    'satisfaction_rating' => null,
                    'response_time_rating' => null,
                    'resolution_quality_rating' => null,
                    'comments' => '',
                ]);
            }
        }

        return $ticket;
    }

    protected function notifySubmitter(Ticket $ticket): void
    {
        $submitter = User::find($ticket->submitter_id);

        if ($submitter) {
            $submitter->notify(new \App\Notifications\StatusUpdated($ticket));
        }
    }

    protected function logStatusChange(Ticket $ticket, string $oldStatus, string $newStatus, int $actorId): void
    {
        \App\Services\TicketHistoryService::log(
            $ticket->id,
            'status_changed',
            $actorId,
            "Status changed from $oldStatus to $newStatus"
        );
    }
}
