<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketAcceptance extends Model
{
    protected $fillable = [
        'ticket_id',
        'supervisor_id',
        'technician_id',
        'is_accepted',
    ];

    // 👇 THIS is what is missing
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    // Optional but recommended
    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}
