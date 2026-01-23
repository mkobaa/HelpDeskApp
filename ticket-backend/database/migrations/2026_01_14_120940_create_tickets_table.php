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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->enum('status', ['open', 'in_progress', 'pending', 'resolved', 'closed'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('low');
            $table->foreignId('category_id')->nullable()->constrained('categories', 'id')->onDelete('cascade');
            $table->foreignId('submitter_id')->constrained('users', 'id')->onDelete('cascade');
            $table->foreignId('assigned_tech_id')->nullable()->constrained('users', 'id')->onDelete('cascade');
            $table->boolean('is_survey_sent')->default(false);
            $table->boolean('is_survey_completed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
