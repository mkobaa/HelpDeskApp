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
		Schema::create('surveys', function (Blueprint $table) {
			$table->id();
			$table->foreignId('ticket_id')->constrained('tickets', 'id')->unique();
			$table->tinyInteger('satisfaction_rating')->check('satisfaction_rating >= 1 AND satisfaction_rating <= 5')->nullable();
			$table->tinyInteger('response_time_rating')->check('response_time_rating >= 1 AND response_time_rating <= 5')->nullable();
			$table->tinyInteger('resolution_quality_rating')->check('resolution_quality_rating >= 1 AND resolution_quality_rating <= 5')->nullable();
			$table->text('comments');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('surveys');
	}
};
