<?php

namespace App\Http\Controllers;

use App\Models\PrinterSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PrinterSettingController extends Controller
{
    /**
     * Mostrar la página de configuración de impresoras
     */
    public function index()
    {
        $settings = PrinterSetting::first();
        // Si no existe, crear registro vacío
        if (!$settings) {
            $settings = PrinterSetting::create([
                'printer_name' => '',
                'printer_type' => 'thermal',
                'auto_print' => false,
                'paper_width' => 80,
                'paper_height' => 200,
                'show_logo' => true,
                'show_business_info' => true,
                'header_message' => '',
                'footer_message' => '¡Gracias por su compra!',
                'paper_size' => '80mm',
            ]);
        }
        return Inertia::render('ConfiguracionTickets', [
            'settings' => $settings,
        ]);
    }

    /**
     * Actualizar la configuración de la impresora
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'printer_name' => 'required|string|max:255',
            'printer_type' => 'required|in:thermal,inkjet,laser',
            'auto_print'   => 'required|boolean',
            'paper_width'  => 'required|integer|min:40',
            'paper_height' => 'required|integer|min:80',
            'show_logo' => 'required|boolean',
            'show_business_info' => 'required|boolean',
            'header_message' => 'nullable|string|max:500',
            'footer_message' => 'nullable|string|max:500',
            'paper_size' => 'required|in:58mm,80mm',
        ]);

        $settings = PrinterSetting::first();
        $settings->update($validated);

        return back()->with('success', 'Configuración de impresora actualizada');
    }
}
