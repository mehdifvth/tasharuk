<?php
// app/Models/User.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Models\Review;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'role',
        'last_seen_at',
    ];

    protected $appends = ['owner_rating', 'borrower_rating', 'owner_reviews_count', 'borrower_reviews_count', 'is_online'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_admin' => 'boolean',
        'last_seen_at' => 'datetime',
    ];

    /**
     * Check if user is online (active in the last 5 minutes)
     */
    public function getIsOnlineAttribute()
    {
        if (!$this->last_seen_at) return false;
        return $this->last_seen_at->gt(now()->subMinutes(5));
    }

    public function tools()
    {
        return $this->hasMany(Tool::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'borrower_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    /**
     * Note en tant que PROPRIÉTAIRE (reçue des emprunteurs)
     */
    public function getOwnerRatingAttribute()
    {
        if (isset($this->attributes['owner_rating_avg'])) {
            return $this->attributes['owner_rating_avg'] ? round($this->attributes['owner_rating_avg'], 1) : null;
        }

        $rating = Review::where('reviewee_id', $this->id)
            ->whereHas('booking.tool', fn($q) => $q->where('user_id', $this->id))
            ->avg('rating');

        return $rating ? round($rating, 1) : null;
    }

    public function getOwnerReviewsCountAttribute()
    {
        if (isset($this->attributes['owner_reviews_received_count'])) {
            return (int) $this->attributes['owner_reviews_received_count'];
        }

        return Review::where('reviewee_id', $this->id)
            ->whereHas('booking.tool', fn($q) => $q->where('user_id', $this->id))
            ->count();
    }

    /**
     * Note en tant qu'EMPRUNTEUR (reçue des propriétaires)
     */
    public function getBorrowerRatingAttribute()
    {
        if (isset($this->attributes['borrower_rating_avg'])) {
            return $this->attributes['borrower_rating_avg'] ? round($this->attributes['borrower_rating_avg'], 1) : null;
        }

        $rating = Review::where('reviewee_id', $this->id)
            ->whereHas('booking', fn($q) => $q->where('borrower_id', $this->id))
            ->avg('rating');

        return $rating ? round($rating, 1) : null;
    }

    public function getBorrowerReviewsCountAttribute()
    {
        if (isset($this->attributes['borrower_reviews_received_count'])) {
            return (int) $this->attributes['borrower_reviews_received_count'];
        }

        return Review::where('reviewee_id', $this->id)
            ->whereHas('booking', fn($q) => $q->where('borrower_id', $this->id))
            ->count();
    }

    /**
     * Normalize email to lowercase
     */
    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => strtolower($value),
            set: fn (string $value) => strtolower($value),
        );
    }
}
