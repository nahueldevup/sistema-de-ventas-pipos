<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_counts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained(); // Quién cerró la caja
            
            // Snapshot del sistema (lo que dice el software)
            $table->decimal('sales_cash', 10, 2);
            $table->decimal('sales_digital', 10, 2);
            $table->decimal('manual_incomes', 10, 2);
            $table->decimal('manual_expenses', 10, 2);
            $table->decimal('expected_cash', 10, 2);
            
            // Datos reales (lo que contó el usuario)
            $table->decimal('counted_cash', 10, 2);
            $table->decimal('difference', 10, 2); // La diferencia (sobra/falta)
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_counts');
    }
};