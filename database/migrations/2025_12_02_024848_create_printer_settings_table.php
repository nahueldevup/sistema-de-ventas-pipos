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
        Schema::create('printer_settings', function (Blueprint $table) {
            $table->id();
            $table->string('printer_name'); // Nombre de la impresora
            $table->enum('printer_type', ['thermal', 'inkjet', 'laser'])->default('thermal'); // Tipo de impresora
            $table->boolean('auto_print')->default(false); // Imprimir automáticamente al generar ticket
            $table->integer('paper_width')->default(80); // Ancho del papel en mm
            $table->integer('paper_height')->default(200); // Alto del papel en mm (opcional)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('printer_settings');
    }
};
