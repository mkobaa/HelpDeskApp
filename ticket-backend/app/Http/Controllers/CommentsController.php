<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Ticket;
use App\Models\User;
use App\Services\TicketHistoryService;
use App\Services\CommentsService;


class CommentsController extends Controller
{
    public function getComments(Request $request, $ticket, CommentsService $commentsService)
    {
        $data = $commentsService->getComments($request, $ticket);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }


    public function addComment(
    Request $request,
    int $ticketId, CommentsService $commentsService) {
    $data = $request->validate([
        'content' => 'required|string',
        'is_user_visible' => 'sometimes|boolean',
    ]);

    $comment = $commentsService->addComment(
        $ticketId,
        $request->user(),
        $data
    );

    return response()->json([
        'success' => true,
        'data' => $comment
    ], 201);
}

}
