<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StatusUpdated extends Notification
{
    use Queueable;

    public function __construct(public $ticket) {}

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'ticket_id' => $this->ticket->id,
            'message' => "#{$this->ticket->id} status updated to {$this->ticket->status} by technician {$this->ticket->assigned_tech_id}"
        ];
    }
}
