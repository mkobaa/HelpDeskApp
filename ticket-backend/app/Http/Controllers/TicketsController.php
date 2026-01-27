<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Services\TicketHistoryService;
use App\Notifications\TicketAssigned;
use App\Models\User;
use App\Models\Attachment;
use Illuminate\Support\Facades\DB;
use App\Models\TicketAcceptance;
use function Symfony\Component\Clock\now;
use App\Services\TicketService;
use App\Services\TicketManagementService;

class TicketsController extends Controller
{
    public function index(Request $request, TicketManagementService $ticketManagementService)
    {
        $user = $request->user();

        $tickets = $ticketManagementService->getTickets($user, $request);

        return response()->json([
            'success' => true,
            'data' => $tickets
        ]);
    }


    public function show(Ticket $ticket)
    {
        $ticket->load(['attachments', 'technician:id,username']);
        return response()->json([
            'success' => true,
            'data' => $ticket
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|string|in:low,medium,high,critical',
            'assigned_tech_id' => 'nullable|integer|exists:users,id',
            'category_id' => 'nullable|integer|exists:categories,id',
            'attachments' => 'array',
            'attachments.*' => 'file|max:10240',
        ]);

        $userId = $request->user()->id;
        $attachments = $request->file('attachments', []);

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

        return response()->json([
            'success' => true,
            'data' => $ticket
        ], 201);
    }


    public function assignTechnician(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'technician_id' => 'required|integer|exists:users,id',
        ]);

        $technician = User::findOrFail($data['technician_id']);

        // Prevent multiple pending assignments for same ticket
        $alreadyPending = TicketAcceptance::where('ticket_id', $ticket->id)
            ->where('is_accepted', 'pending')
            ->exists();

        if ($alreadyPending) {
            return response()->json([
                'message' => 'There is already a pending assignment for this ticket.'
            ], 409);
        }

        // Create workflow record (pending)
        $acceptance = TicketAcceptance::create([
            'ticket_id'      => $ticket->id,
            'supervisor_id' => auth()->id(),          // from token
            'technician_id' => $technician->id,
            'is_accepted'   => 'pending',
        ]);

        // Log history: request, not real assignment yet
        TicketHistoryService::log(
            $ticket->id,
            'assignment_requested',
            auth()->id(),
            "Assignment requested for technician ID {$technician->id}"
        );

        // Notify technician: pending request
        $technician->notify(new TicketAssigned($ticket)); 
        // (You may later rename this notification to TicketAssignmentRequested)

        return response()->json([
            'success' => true,
            'data' => $acceptance
        ], 201);
    }



    public function reassignTechnician(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'technician_id' => 'required|integer|exists:users,id',
        ]);

        $newTechnician = User::findOrFail($data['technician_id']);

        // Prevent multiple pending reassignments
        $alreadyPending = TicketAcceptance::where('ticket_id', $ticket->id)
            ->where('is_accepted', 'pending')
            ->exists();

        if ($alreadyPending) {
            return response()->json([
                'message' => 'There is already a pending assignment request for this ticket.'
            ], 409);
        }

        // Create new pending acceptance
        $acceptance = TicketAcceptance::create([
            'ticket_id'      => $ticket->id,
            'supervisor_id' => auth()->id(),
            'technician_id' => $newTechnician->id,
            'is_accepted'   => 'pending',
        ]);

        // Log history: reassignment requested
        TicketHistoryService::log(
            $ticket->id,
            'reassignment_requested',
            auth()->id(),
            "Reassignment requested from technician ID {$ticket->assigned_tech_id} to ID {$newTechnician->id}"
        );

        // Notify new technician: pending reassignment
        $newTechnician->notify(new TicketAssigned($ticket)); 
        // (Later: TicketReassignmentRequested)

        return response()->json([
            'success' => true,
            'data' => $acceptance
        ], 201);
    }


    public function updateStatus(Request $request, Ticket $ticket, TicketService $ticketService)
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        try {
            $ticket = $ticketService->changeStatus(
                $ticket,
                $request->status,
                auth()->id()
            );
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }

        return response()->json($ticket);
    }


    public function technicianWorkloads()
    {
        $workloads = Ticket::selectRaw("
                assigned_tech_id,
                COUNT(*) as ticket_count,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count
            ")
            ->whereNotNull('assigned_tech_id')
            ->groupBy('assigned_tech_id')
            ->with('technician:id,username,email')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $workloads
        ]);
    }


    public function getHistoryLogs()
    {
        $logs = TicketHistory::with('user:id,username,email')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    public function getAssignedTickets(Request $request, $id)
    {
        $tickets = Ticket::with(['category', 'attachments'])
            ->where('assigned_tech_id', $id)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->priority, fn($q) => $q->where('priority', $request->priority))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->paginate(20);

        return response()->json([
            'data' => $tickets
        ]);
    }


}
