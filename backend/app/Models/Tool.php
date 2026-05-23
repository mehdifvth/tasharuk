<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tool extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'condition',
        'price',
        'image',
        'latitude',
        'longitude',
        'city',
    ];

    protected $appends = ['image_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function getImageUrlAttribute()
    {
        if (!$this->image) return null;
        // Si c'est déjà une URL complète (Cloudinary)
        if (str_starts_with($this->image, 'http')) return $this->image;
        // Sinon ancienne image locale
        return asset('storage/' . $this->image);
    }
}
