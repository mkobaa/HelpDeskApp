<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use App\Models\TimeTracking;
use App\Models\Survey;

class ReportsController extends Controller
{
    public function averageResolutionTime(Request $request)
    {
        $from = $request->query('from');
        $to   = $request->query('to');

        $query = Ticket::where('status', 'closed');

        if ($from && $to) {
            $query->whereBetween('created_at', [$from, $to]);
        }

        $averageTime = $query->join('time_tracking', 'tickets.id', '=', 'time_tracking.ticket_id')
            ->avg('time_tracking.total_time_minutes');

        return response()->json([
            'success' => true,
            'data' => [
                'average_resolution_time_minutes' => round($averageTime, 2),
                'period' => [
                    'from' => $from,
                    'to' => $to,
                ]
            ]
        ]);
    }

    public function ticketsResolved(Request $request)
    {
        $query = Ticket::where('status', 'closed');

        if ($request->query('from') && $request->query('to')) {
            $query->whereBetween('created_at', [
                $request->query('from'),
                $request->query('to'),
            ]);
        }

        if ($request->query('technician_id')) {
            $query->where('assigned_tech_id', $request->query('technician_id'));
        }
        if ($request->query('priority')) {
            $query->where('priority', $request->query('priority'));
        }

        if ($request->query('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        $ticketsResolved = $query->count();

        return response()->json([
            'success' => true,
            'data' => [
                'tickets_resolved' => $ticketsResolved
            ]
        ]);
    }

    public function customerSatisfaction(Request $request)
    {
        $query = Survey::query();

        if ($request->query('from') && $request->query('to')) {
            $query->whereHas('ticket', function ($q) use ($request) {
                $q->whereBetween('created_at', [
                    $request->query('from'),
                    $request->query('to'),
                ]);
            });
        }

        if ($request->query('technician_id')) {
            $query->whereHas('ticket', function ($q) use ($request) {
                $q->where('assigned_tech_id', $request->query('technician_id'));
            });
        }


        $averageSatisfaction = $query->avg('satisfaction_rating');

        return response()->json([
            'success' => true,
            'data' => [
                'average_satisfaction_rating' => round($averageSatisfaction, 2)
            ]
        ]);
    }


    public function ticketsResolvedOverTime(Request $request)
    {
        $from = $request->query('from');
        $to   = $request->query('to');

        $query = Ticket::where('status', 'closed');

        if ($from && $to) {
            $query->whereBetween('created_at', [$from, $to]);
        }

        $rows = $query
            ->selectRaw('created_at::date as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $labels = $rows->pluck('date')->map(fn($d) => (string) $d);
        $values = $rows->pluck('count');

        return response()->json([
            'success' => true,
            'labels' => $labels,
            'values' => $values
        ]);
    }


    public function solutionTimeTrends(Request $request)
    {
        $from = $request->query('from');
        $to   = $request->query('to');

        $query = Ticket::where('tickets.status', 'closed')
            ->join('time_tracking', 'tickets.id', '=', 'time_tracking.ticket_id');

        if ($from && $to) {
            $query->whereBetween('time_tracking.created_at', [$from, $to]);
        }

        $rows = $query
            ->selectRaw("
                TO_CHAR(DATE_TRUNC('day', time_tracking.created_at), 'YYYY-MM-DD') as date,
                AVG(time_tracking.total_time_minutes) as avg_time
            ")
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $labels = $rows->pluck('date')->map(fn($d) => $d->format('Y-m-d'));
        $values = $rows->pluck('avg_time')->map(fn($v) => round($v, 2));

        return response()->json([
            'success' => true,
            'labels' => $labels,
            'values' => $values
        ]);
    }
}
