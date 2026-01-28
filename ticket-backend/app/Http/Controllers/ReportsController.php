<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use App\Models\TimeTracking;
use App\Models\Survey;
use Illuminate\Support\Facades\DB;

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


        // Fetch raw ratings and compute average in PHP to avoid DB-specific AVG quirks
        $ratings = $query->pluck('satisfaction_rating')
            ->filter(function ($v) { return $v !== null; })
            ->map(function ($v) { return (float) $v; });

        $count = $ratings->count();
        $avg = $count === 0 ? null : round($ratings->sum() / $count, 2);

        return response()->json([
            'success' => true,
            'data' => [
                'average_satisfaction_rating' => $avg,
                'survey_count' => $count,
                // debug: include a small sample of raw ratings to help verify stored values
                'ratings_sample' => $ratings->values()->take(20)->all(),
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


    // public function exportReport(Request $request)
    public function exportReport(Request $request)
    {
        // Build base query joining time_tracking, technician and survey (survey is unique per ticket)
        $query = DB::table('tickets')
            ->leftJoin('time_tracking', 'tickets.id', '=', 'time_tracking.ticket_id')
            ->leftJoin('users as tech', 'tickets.assigned_tech_id', '=', 'tech.id')
            ->leftJoin('surveys', 'tickets.id', '=', 'surveys.ticket_id')
            ->select([
                'tickets.id as ticket_id',
                'tickets.title',
                'tickets.status',
                'tickets.priority',
                'tech.username as technician_name',
                'tickets.created_at as created_at',
                'time_tracking.end_time as closed_at',
                'time_tracking.total_time_minutes as resolution_minutes',
                'surveys.satisfaction_rating as satisfaction'
            ]);

        // Filters (keep same semantics as other report endpoints)
        if ($request->query('from') && $request->query('to')) {
            $query->whereBetween('tickets.created_at', [$request->query('from'), $request->query('to')]);
        }
        if ($request->query('technician_id')) {
            $query->where('tickets.assigned_tech_id', $request->query('technician_id'));
        }
        if ($request->query('priority')) {
            $query->where('tickets.priority', $request->query('priority'));
        }
        if ($request->query('category_id')) {
            $query->where('tickets.category_id', $request->query('category_id'));
        }

        $fileName = 'reports_export_' . date('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ];

        $callback = function () use ($query) {
            $handle = fopen('php://output', 'w');
            // Emit UTF-8 BOM for Excel compatibility and CSV headers
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['Ticket ID', 'Title', 'Status', 'Priority', 'Technician', 'Created At', 'Closed At', 'Resolution Minutes', 'Satisfaction']);

            // Use cursor to stream rows
            foreach ($query->orderBy('tickets.created_at', 'desc')->cursor() as $row) {
                $created = $row->created_at ? (string)$row->created_at : '';
                $closed = $row->closed_at ? (string)$row->closed_at : '';
                $resolution = is_null($row->resolution_minutes) ? '' : (string)$row->resolution_minutes;
                $satisfaction = is_null($row->satisfaction) ? '' : (string)$row->satisfaction;
                fputcsv($handle, [
                    $row->ticket_id,
                    $row->title,
                    $row->status,
                    $row->priority,
                    $row->technician_name,
                    $created,
                    $closed,
                    $resolution,
                    $satisfaction,
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        // Build same query as CSV export
        $query = DB::table('tickets')
            ->leftJoin('time_tracking', 'tickets.id', '=', 'time_tracking.ticket_id')
            ->leftJoin('users as tech', 'tickets.assigned_tech_id', '=', 'tech.id')
            ->leftJoin('surveys', 'tickets.id', '=', 'surveys.ticket_id')
            ->select([
                'tickets.id as ticket_id',
                'tickets.title',
                'tickets.status',
                'tickets.priority',
                'tech.username as technician_name',
                'tickets.created_at as created_at',
                'time_tracking.end_time as closed_at',
                'time_tracking.total_time_minutes as resolution_minutes',
                'surveys.satisfaction_rating as satisfaction'
            ]);

        if ($request->query('from') && $request->query('to')) {
            $query->whereBetween('tickets.created_at', [$request->query('from'), $request->query('to')]);
        }
        if ($request->query('technician_id')) {
            $query->where('tickets.assigned_tech_id', $request->query('technician_id'));
        }
        if ($request->query('priority')) {
            $query->where('tickets.priority', $request->query('priority'));
        }
        if ($request->query('category_id')) {
            $query->where('tickets.category_id', $request->query('category_id'));
        }

        // Build simple HTML table
        $rows = $query->orderBy('tickets.created_at', 'desc')->get();
        $html = '<!doctype html><html><head><meta charset="utf-8"><title>Reports Export</title>';
        $html .= '<style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px;text-align:left;font-size:12px}</style>';
        $html .= '</head><body>'; 
        $html .= '<h2>Reports Export</h2>';
        $html .= '<table><thead><tr><th>Ticket ID</th><th>Title</th><th>Status</th><th>Priority</th><th>Technician</th><th>Created At</th><th>Closed At</th><th>Resolution Minutes</th><th>Satisfaction</th></tr></thead><tbody>';
        foreach ($rows as $row) {
            $created = $row->created_at ? (string)$row->created_at : '';
            $closed = $row->closed_at ? (string)$row->closed_at : '';
            $resolution = is_null($row->resolution_minutes) ? '' : (string)$row->resolution_minutes;
            $satisfaction = is_null($row->satisfaction) ? '' : (string)$row->satisfaction;
            $html .= '<tr>';
            $html .= '<td>' . htmlspecialchars($row->ticket_id) . '</td>';
            $html .= '<td>' . htmlspecialchars($row->title) . '</td>';
            $html .= '<td>' . htmlspecialchars($row->status) . '</td>';
            $html .= '<td>' . htmlspecialchars($row->priority) . '</td>';
            $html .= '<td>' . htmlspecialchars($row->technician_name) . '</td>';
            $html .= '<td>' . htmlspecialchars($created) . '</td>';
            $html .= '<td>' . htmlspecialchars($closed) . '</td>';
            $html .= '<td>' . htmlspecialchars($resolution) . '</td>';
            $html .= '<td>' . htmlspecialchars($satisfaction) . '</td>';
            $html .= '</tr>';
        }
        $html .= '</tbody></table></body></html>';

        // If Dompdf is available, render PDF; otherwise return HTML for client to print
        if (class_exists(\Dompdf\Dompdf::class)) {
            $dompdf = new \Dompdf\Dompdf();
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'landscape');
            $dompdf->render();
            $output = $dompdf->output();
            $fileName = 'reports_export_' . date('Ymd_His') . '.pdf';
            return response($output, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            ]);
        }

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=utf-8',
            'Content-Disposition' => 'inline; filename="reports_export.html"',
        ]);
    }
}
