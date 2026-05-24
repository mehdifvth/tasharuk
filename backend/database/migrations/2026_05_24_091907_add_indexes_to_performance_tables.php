<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->index(['latitude', 'longitude']);
            $table->index('city');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->index('reviewee_id');
            $table->index('rating');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropIndex(['latitude', 'longitude']);
            $table->dropIndex(['city']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['reviewee_id']);
            $table->dropIndex(['rating']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'is_read']);
        });
    }
};
