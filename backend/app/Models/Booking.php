<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'tool_id',
        'borrower_id',
        'start_date',
        'end_date',
        'status',
        'confirmation_code',
        'picked_up_at',
        'returned_at',
    ];

    protected $appends = ['total_price'];

    public function tool()
    {
        return $this->belongsTo(Tool::class);
    }
    public function borrower()
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function getTotalPriceAttribute()
    {
        if (!$this->tool) return 0;

        $start = \Carbon\Carbon::parse($this->start_date);
        $end = \Carbon\Carbon::parse($this->end_date);

        $days = $start->diffInDays($end) + 1; // On compte le jour de début et de fin

        return $days * $this->tool->price;
    }
}
