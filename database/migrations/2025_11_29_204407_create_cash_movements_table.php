<?php
//php artisan make:model CashMovement -mfs
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
      Schema::create('cash_movements', function (Blueprint $table) {
    $table->id();
    $table->string('type'); // 'income' o 'expense'
    $table->decimal('amount', 10, 2);
    $table->string('description');
    $table->foreignId('user_id')->constrained();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_movements');
    }
};
