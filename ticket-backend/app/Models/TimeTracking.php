<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimeTracking extends Model
{
    protected $table = 'time_tracking';

    protected $fillable = [
        'ticket_id',
        'technician_id',
        'start_time',
        'end_time',
        'total_time_minutes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'total_time_minutes' => 'integer',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }
}
