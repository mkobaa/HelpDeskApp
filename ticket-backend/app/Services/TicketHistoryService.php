<?php

namespace App\Services;

use App\Models\TicketHistory;

class TicketHistoryService
{
    public static function log($ticketId, $action, $actorId, $notes = null)
    {
        return TicketHistory::create([
            'ticket_id' => $ticketId,
            'action' => $action,
            'actor_id' => $actorId,
            'notes' => $notes
        ]);
    }

    public static function logCommentAdded($ticketId, $user, $comment)
    {
        $notes = "Comment ID {$comment->id} added by User ID {$user->id}";
        return self::log($ticketId, 'comment_added', $user->id, $notes);
    }

}
