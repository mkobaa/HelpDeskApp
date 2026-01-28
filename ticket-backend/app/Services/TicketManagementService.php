<?php 

namespace App\Services;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Attachment;


class TicketManagementService
{
    public function getTickets(User $user, Request $request)
    {
        if ($user->role === 'user')
        {
            $tickets = Ticket::with(['category', 'attachments'])
            ->where('submitter_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        }
        else if ($user->role === 'technician')
        {
            $tickets = Ticket::with(['category', 'attachments'])
            ->where('assigned_tech_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        }
        else if ($user->role === 'supervisor')
        {
            $tickets = Ticket::with(['category', 'attachments'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->priority, fn($q) => $q->where('priority', $request->priority))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        }
        return $tickets;
    }

    protected function createBaseTicket(array $data, User $user): Ticket
    {
        return Ticket::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'priority' => $data['priority'],
            'assigned_tech_id' => $data['assigned_tech_id'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'submitter_id' => $user->id,
        ]);
    }

    protected function createTimeTracking(Ticket $ticket): void
    {
        $ticket->timeTracking()->create([
            'start_time' => $ticket->created_at,
        ]);
    }

    protected function handleAttachments(Ticket $ticket, array $attachments, User $user): void
    {
        if (empty($attachments)) {
            return;
        }

        $now = now();
        $rows = [];

        foreach ($attachments as $file) {
            $path = $file->store('attachments', 'public');

            $rows[] = [
                'ticket_id' => $ticket->id,
                'file_path' => $path,
                'uploaded_by' => $user->id,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($rows) {
            Attachment::insert($rows);
        }
    }

    protected function logHistory(Ticket $ticket, User $user): void
    {
        TicketHistoryService::log(
            $ticket->id,
            'ticket_created',
            $user->id,
            'Ticket created'
        );
    }

    public function createTicket(array $data, User $user, array $attachments)
    {
        return DB::transaction(function () use ($data, $user, $attachments) {

            $ticket = $this->createBaseTicket($data, $user);

            $this->createTimeTracking($ticket);

            $this->handleAttachments($ticket, $attachments, $user);

            $this->logHistory($ticket, $user);

            return $ticket;
        });
    }
}