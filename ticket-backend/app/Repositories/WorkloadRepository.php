<?php

namespace App\Repositories;

use App\Models\Ticket;

class WorkloadRepository
{
    public function getTechnicianWorkloads()
    {
        return Ticket::selectRaw("
                assigned_tech_id,
                COUNT(*) as ticket_count,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count
            ")
            ->whereNotNull('assigned_tech_id')
            ->groupBy('assigned_tech_id')
            ->with('technician:id,username,email')
            ->get();
    }
}
