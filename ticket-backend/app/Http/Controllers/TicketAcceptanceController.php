<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\TicketAcceptance;
use App\Models\User;
use App\Notifications\TicketAccepted;
use App\Notifications\TicketRejected;


class TicketAcceptanceController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $acceptances = TicketAcceptance::where('technician_id', $user->id)
            ->where('is_accepted', 'pending')          
            ->with(['ticket:id,title,priority,status'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $acceptances
        ]);
    }


    public function store(Request $request, $ticketId)
    {
        $data = $request->validate([
            'technician_id' => 'required|exists:users,id',
            'is_accepted' => 'required|in:accepted,rejected,pending',
        ]);

        $ticket = Ticket::findOrFail($ticketId);

        $assignement = TicketAcceptance::create([
            'ticket_id' => $ticket->id,
            'supervisor_id' => auth()->id(),
            'technician_id' => $data['technician_id'],
            'is_accepted' => $data['is_accepted'],
        ]);


        return response()->json([
            'success' => true,
            'data' => $assignement
        ], 201);
    }


    public function isPending($ticketId)
    {
        $pending = TicketAcceptance::with('technician')
            ->where('ticket_id', $ticketId)
            ->where('is_accepted', 'pending')
            ->first();

        $technicianName = null;
        $technicianId = null;
        $isPending = false;
        $status = null;

        if ($pending) {
            $isPending = true;
            $status = 'pending';
            if ($pending->technician) {
                $technicianName = $pending->technician->username;
                $technicianId = $pending->technician->id;
            }
        } else {
            // If no pending acceptance, check if someone already accepted
            $accepted = TicketAcceptance::with('technician')
                ->where('ticket_id', $ticketId)
                ->where('is_accepted', 'accepted')
                ->orderBy('created_at', 'desc')
                ->first();

            if ($accepted) {
                $isPending = false;
                $status = 'accepted';
                if ($accepted->technician) {
                    $technicianName = $accepted->technician->username;
                    $technicianId = $accepted->technician->id;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'is_pending' => $isPending,
                'status' => $status,
                'technician_name' => $technicianName,
                'technician_id' => $technicianId
            ]
        ]);
    }


    public function accept($ticketId)
    {
        $user = auth()->user();
        $ticket = Ticket::find($ticketId);

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $acceptance = TicketAcceptance::where('ticket_id', $ticketId)
            ->where('technician_id', $user->id)
            ->where('is_accepted', 'pending')
            ->first();

        if (!$acceptance) {
            return response()->json(['message' => 'No pending acceptance found for this ticket and technician.'], 404);
        }

        $acceptance->is_accepted = 'accepted';
        $acceptance->save();
        $ticket->assigned_tech_id = $user->id;
        $ticket->status = 'in_progress';
        $ticket->save();

        $superVisors = User::where('role', 'supervisor')->get();
        foreach ($superVisors as $supervisor) {
            $supervisor->notify(new TicketAccepted($ticket));
        }
        $ticket->submitter->notify(new TicketAccepted($ticket));

        return response()->json([
            'success' => true,
            'message' => 'Ticket acceptance updated to accepted.',
            'data' => $acceptance
        ]);
    }

    public function reject($ticketId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $acceptance = TicketAcceptance::where('ticket_id', $ticketId)
            ->where('technician_id', $user->id)
            ->where('is_accepted', 'pending')
            ->first();

        if (!$acceptance) {
            return response()->json(['message' => 'No pending acceptance found for this ticket and technician.'], 404);
        }

        $acceptance->is_accepted = 'rejected';
        $acceptance->save();

        $superVisors = User::where('role', 'supervisor')->get();
        $ticket = Ticket::find($ticketId);
        foreach ($superVisors as $supervisor) {
            $supervisor->notify(new TicketRejected($ticket));
        }

        return response()->json([
            'success' => true,
            'message' => 'Ticket acceptance updated to rejected.',
            'data' => $acceptance
        ]);
    }
}
