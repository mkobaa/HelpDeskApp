<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = ['title', 'description', 'status', 'priority', 'submitter_id', 'assigned_tech_id', 'category_id'];

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitter_id');
    }

    public function assignedTech()
    {
        return $this->belongsTo(User::class, 'assigned_tech_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'assigned_tech_id');
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function timeTracking()
    {
        return $this->hasOne(TimeTracking::class, 'ticket_id');
    }


}