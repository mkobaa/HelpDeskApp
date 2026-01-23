<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * id INTEGER PRIMARY KEY AUTO_INCREMENT,
    ticket_id INTEGER NOT NULL,
    satisfaction_rating TINYINT CHECK (satisfaction_rating BETWEEN 1 AND 5),
    response_time_rating TINYINT CHECK (response_time_rating BETWEEN 1 AND 5),
    resolution_quality_rating TINYINT CHECK (resolution_quality_rating BETWEEN 1 AND 5),
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)

 */

class Survey extends Model
{
    protected $fillable = [
        'ticket_id',
        'satisfaction_rating',
        'response_time_rating',
        'resolution_quality_rating',
        'comments',
        'submitted_at',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }
}
