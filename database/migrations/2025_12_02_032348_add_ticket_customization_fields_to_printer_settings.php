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
        Schema::table('printer_settings', function (Blueprint $table) {
            $table->boolean('show_logo')->default(true)->after('printer_type');
            $table->boolean('show_business_info')->default(true)->after('show_logo');
            $table->text('header_message')->nullable()->after('show_business_info');
            $table->text('footer_message')->nullable()->after('header_message');
            $table->enum('paper_size', ['58mm', '80mm'])->default('80mm')->after('footer_message');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('printer_settings', function (Blueprint $table) {
            $table->dropColumn(['show_logo', 'show_business_info', 'header_message', 'footer_message', 'paper_size']);
        });
    }
};
