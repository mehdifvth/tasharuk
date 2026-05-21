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
        'return_code',
        'picked_up_at',
        'returned_at',
    ];

    protected $appends = ['total_price', 'live_price', 'final_price'];

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
        $end   = \Carbon\Carbon::parse($this->end_date);
        $days  = $start->diffInDays($end) + 1;
        return $days * $this->tool->price;
    }

    // Prix en cours basé sur le temps réel écoulé depuis pickup
    public function getLivePriceAttribute()
    {
        if (!$this->tool || !$this->picked_up_at) return 0;
        $hours = \Carbon\Carbon::parse($this->picked_up_at)->diffInMinutes(now()) / 60;
        $days  = max(1, ceil($hours / 24)); // minimum 1 jour
        return $days * $this->tool->price;
    }

    // Prix final basé sur la durée réelle (pickup → return)
    public function getFinalPriceAttribute()
    {
        if (!$this->tool || !$this->picked_up_at || !$this->returned_at) return 0;

        $minutes = \Carbon\Carbon::parse($this->picked_up_at)->diffInMinutes($this->returned_at);

        if ($minutes <= 24 * 60) {
            // Moins de 24h → 1 jour minimum
            return $this->tool->price;
        }

        // Au-delà → par minute
        $pricePerMinute = $this->tool->price / 24 / 60;
        return round($minutes * $pricePerMinute, 2);
    }
}
