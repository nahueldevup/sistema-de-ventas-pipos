<?php
//php artisan make:model SaleDetail -mfs
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_details', function (Blueprint $table) {
            $table->id();
            // Si borras la venta, se borran sus detalles (Cascade)
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            
            // Si borras el producto, aquí queda NULL pero conservamos los datos de texto abajo
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            
            // SNAPSHOT: Guardamos copia de cómo era el producto en ese momento
            $table->string('product_barcode')->nullable();
            $table->string('product_name');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2); // Precio al momento de la venta
            $table->decimal('cost', 10, 2)->default(0); // Costo al momento (para calcular ganancia real)
            $table->decimal('line_total', 10, 2); // quantity * unit_price
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_details');
    }
};