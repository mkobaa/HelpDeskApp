<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Services\TicketService;
use App\Services\TicketManagementService;
use App\Services\TechAssignementService;
use App\Repositories\WorkloadRepository;

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
        $ticket->load(['attachments', 'technician:id,username', 'category:id,name']);
        return response()->json([
            'success' => true,
            'data' => $ticket
        ]);
    }

    public function store(Request $request, TicketManagementService $ticketService)
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

        $user = $request->user();
        $attachments = $request->file('attachments', []);

        $ticket = $ticketService->createTicket($data, $user, $attachments);

        return response()->json([
            'success' => true,
            'data' => $ticket
        ], 201);
    }

    public function assignTechnician(Request $request, Ticket $ticket, TechAssignementService $service) 
    {
        $data = $request->validate([
            'technician_id' => 'required|integer|exists:users,id',
        ]);

        try
        {
            $acceptance = $service->assignTechnician(
                $data,
                $request->user(),
                $ticket
            );

            return response()->json([
                'success' => true,
                'data' => $acceptance
            ], 201);

        }
        catch (\DomainException $e)
        {
            return response()->json([
                'message' => $e->getMessage()
            ], 409);
        }
    }

    public function reassignTechnician(Request $request, Ticket $ticket, TechAssignementService $service) 
    {
        
        $data = $request->validate([
            'technician_id' => 'required|integer|exists:users,id',
        ]);

        try
        {
            $acceptance = $service->reassignTechnician(
                $data,
                $request->user(),
                $ticket
            );

            return response()->json([
                'success' => true,
                'data' => $acceptance
            ], 201);

        }
        catch (\DomainException $e)
        {
            return response()->json([
                'message' => $e->getMessage()
            ], 409);
        }
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


    public function technicianWorkloads(WorkloadRepository $workloads)
    {
        return response()->json([
            'success' => true,
            'data' => $workloads->getTechnicianWorkloads()
        ]);
    }


    public function getHistoryLogs()
    {
        $logs = TicketHistory::with('user:id,username,email')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

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
