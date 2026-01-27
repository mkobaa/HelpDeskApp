<?php 

namespace App\Services;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;


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


    public function createTicket($data , $userId, $attachments)
    {
        $ticket = DB::transaction(function () use ($data, $userId, $attachments) {

            // 1. Create ticket
            $ticket = Ticket::create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'priority' => $data['priority'],
                'assigned_tech_id' => $data['assigned_tech_id'] ?? null,
                'category_id' => $data['category_id'] ?? null,
                'submitter_id' => $userId,
            ]);

            // 2. Create time tracking (ONE clean line)
            $ticket->timeTracking()->create([
                'start_time' => $ticket->created_at,
            ]);

            // 3. Bulk insert attachments
            if (!empty($attachments)) {
                $now = now();
                $rows = [];

                foreach ($attachments as $file) {
                    $path = $file->store('attachments', 'public');

                    $rows[] = [
                        'ticket_id' => $ticket->id,
                        'file_path' => $path,
                        'uploaded_by' => $userId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if ($rows) {
                    Attachment::insert($rows);
                }
            }

            // 4. History
            TicketHistoryService::log(
                $ticket->id,
                'ticket_created',
                $userId,
                'Ticket created'
            );

            return $ticket;
        });

        $ticket->load('attachments');
    }
}