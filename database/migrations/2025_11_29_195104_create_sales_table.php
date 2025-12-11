<?php
//php artisan make:model Sale -mcrfs
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_number', 50)->unique()->nullable(); // Generaremos un UUID o folio
            
            // Relaciones
            $table->foreignId('client_id')->nullable()->constrained();
            $table->foreignId('user_id')->constrained(); // El vendedor
            
            // Totales
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            
            // Pago (Lo he dejado abierto a string para flexibilidad con tu frontend)
            $table->string('payment_method')->default('efectivo'); 
            $table->decimal('amount_paid', 10, 2); // Cuánto entregó el cliente
            $table->decimal('change_amount', 10, 2)->default(0); // El cambio
            
            $table->softDeletes(); // Por si anulas una venta
            $table->timestamps();

            $table->index('created_at');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};