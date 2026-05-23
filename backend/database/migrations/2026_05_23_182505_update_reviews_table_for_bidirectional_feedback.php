<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Drop foreign key and unique together if they are tied
            $table->dropForeign(['booking_id']);
            $table->dropUnique(['booking_id']);
            
            // Re-add foreign key without unique
            $table->foreign('booking_id')->references('id')->on('bookings')->cascadeOnDelete();
            
            // Ajouter le destinataire de l'avis
            $table->foreignId('reviewee_id')->after('reviewer_id')->nullable()->constrained('users')->cascadeOnDelete();
            
            // Nouvelle contrainte : un utilisateur ne peut laisser qu'un seul avis par réservation
            $table->unique(['booking_id', 'reviewer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique(['booking_id', 'reviewer_id']);
            $table->dropConstrainedForeignId('reviewee_id');
            
            $table->dropForeign(['booking_id']);
            $table->unique('booking_id');
            $table->foreign('booking_id')->references('id')->on('bookings')->cascadeOnDelete();
        });
    }
};
