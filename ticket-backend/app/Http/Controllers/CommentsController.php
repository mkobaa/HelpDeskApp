<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Ticket;
use App\Models\User;
use App\Services\TicketHistoryService;
use App\Notifications\CommentAddedToTicket;


class CommentsController extends Controller
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

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }


    public function addComment(Request $request, $ticketId)
    {
        $comments = $request->validate([
            'content' => 'required|string',
            'is_user_visible' => 'sometimes|boolean',
        ]);
        $superVisors = User::where('role', 'supervisor')->get();
        $ticket = Ticket::findOrFail($ticketId);
        $technicianToNotify = $ticket->assignedTech;
        $userToNotify = $ticket->submitter;

        // Enforce that only supervisors and technicians may set `is_user_visible`.
        $role = $request->user()->role ?? null;
        if ($role === 'supervisor' || $role === 'technician') {
            $isUserVisible = $comments['is_user_visible'] ?? true;
        } else {
            // Regular users cannot override visibility; comments they create are visible to users.
            $isUserVisible = true;
        }

        $comment = Comment::create([
            'ticket_id' => $ticketId,
            'user_id' => $request->user()->id,
            'content' => $comments['content'],
            'is_user_visible' => $isUserVisible,
        ]);


        TicketHistoryService::logCommentAdded($ticketId, $request->user(), $comment);

        if ($userToNotify && $userToNotify->id != $request->user()->id && $comment->is_user_visible) {
                $userToNotify->notify(new CommentAddedToTicket($comment, $ticketId));
        }
        foreach ($superVisors as $supervisor) {
            if ($supervisor->id != $request->user()->id)
                $supervisor->notify(new CommentAddedToTicket($comment, $ticketId));
        }

        if ($technicianToNotify && $technicianToNotify->id != $request->user()->id) {
            $technicianToNotify->notify(new CommentAddedToTicket($comment, $ticketId));
        }


        return response()->json([
            'success' => true,
            'data' => $comment
        ])->setStatusCode(201);
    }
}
