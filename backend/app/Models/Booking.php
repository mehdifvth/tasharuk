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
        'total_price',
        'final_price',
        'confirmation_code',
        'return_code',
        'picked_up_at',
        'returned_at',
    ];

    protected $appends = ['live_price', 'display_total_price', 'display_final_price'];

    public function tool()
    {
        return $this->belongsTo(Tool::class)->withTrashed();
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

    // Prix estimé (Utilise la colonne total_price ou calcule dynamiquement)
    public function getDisplayTotalPriceAttribute()
    {
        if ($this->total_price > 0) return $this->total_price;
        if (!$this->tool) return 0;

        $start = \Carbon\Carbon::parse($this->start_date);
        $end   = \Carbon\Carbon::parse($this->end_date);
        $hours = $start->diffInMinutes($end) / 60;

        // Prix à l'heure direct
        return round($hours * $this->tool->price, 2);
    }

    // Prix en cours basé sur le temps réel écoulé depuis pickup
    public function getLivePriceAttribute()
    {
        if (!$this->tool || !$this->picked_up_at || $this->status === 'completed') return 0;
        
        $hours = \Carbon\Carbon::parse($this->picked_up_at)->diffInMinutes(now()) / 60;
        return round($hours * $this->tool->price, 2);
    }

    // Prix final (Utilise la colonne final_price ou calcule dynamiquement)
    public function getDisplayFinalPriceAttribute()
    {
        if ($this->final_price > 0) return $this->final_price;
        if (!$this->tool || !$this->picked_up_at || !$this->returned_at) return 0;

        $hours = \Carbon\Carbon::parse($this->picked_up_at)->diffInMinutes($this->returned_at) / 60;
        return round($hours * $this->tool->price, 2);
    }
}
