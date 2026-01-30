<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketHistory extends Model
{
    protected $table = 'ticket_history';

    protected $fillable = [
        'ticket_id',
        'action',
        'actor_id',
        'notes'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
