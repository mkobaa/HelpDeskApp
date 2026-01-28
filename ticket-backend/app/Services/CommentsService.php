<?php

namespace App\Services;

use App\Models\User;
use App\Models\Comment;
use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Notifications\CommentAddedToTicket;
use App\Services\TicketHistoryService;


class CommentsService
{
    public function getComments(Request $request, $ticketId)
    {
        $user = $request->user();

        if ($user->role === 'supervisor' || $user->role === 'technician') {
            $comments = Comment::with('user')
                ->where('ticket_id', $ticketId)
                ->get();
        } else {
            $comments = Comment::with('user')
                ->where('ticket_id', $ticketId)
                ->where('is_user_visible', true)
                ->get();
        }
        

        $data = $comments->map(function ($comment) {
            return [
                'id' => $comment->id,
                'content' => $comment->content,
                'created_at' => $comment->created_at,
                'is_user_visible' => $comment->is_user_visible,
                'user_id' => $comment->user_id,
                'username' => $comment->user->username,
            ];
        });

        return $data;
    }


    public function addComment(int $ticketId, User $author, array $data): Comment {
        $ticket = Ticket::findOrFail($ticketId);

        $isUserVisible = $this->resolveVisibility(
            $author,
            $data
        );

        $comment = $this->createComment(
            $ticket,
            $author,
            $data['content'],
            $isUserVisible
        );

        $this->logHistory($ticket, $author, $comment);

        $this->notifyUsers($ticket, $author, $comment);

        return $comment;
    }


    protected function resolveVisibility(User $author, array $data): bool {
        if (in_array($author->role, ['supervisor', 'technician']))
        {
            return $data['is_user_visible'] ?? true;
        }

        return true;
    }

    protected function createComment(Ticket $ticket, User $author, string $content, bool $isUserVisible): Comment
    {
        return Comment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $author->id,
            'content' => $content,
            'is_user_visible' => $isUserVisible,
        ]);
    }

    protected function logHistory(Ticket $ticket, User $author, Comment $comment): void
    {
        TicketHistoryService::logCommentAdded(
            $ticket->id,
            $author,
            $comment
        );
    }

    protected function notifyUsers(Ticket $ticket, User $author, Comment $comment): void
    {
        $supervisors = User::where('role', 'supervisor')->get();

        $recipients = collect([
            $ticket->submitter,
            $ticket->assignedTech,
        ])
        ->merge($supervisors)
        ->filter()
        ->unique('id')
        ->reject(fn ($user) => $user->id === $author->id);

        foreach ($recipients as $user) {
            if ($user->id === $ticket->submitter_id && !$comment->is_user_visible) {
                continue;
            }

            $user->notify(
                new CommentAddedToTicket($comment, $ticket->id)
            );
        }
    }


}
