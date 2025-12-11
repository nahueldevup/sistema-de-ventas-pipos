<?php

namespace App\Http\Controllers;

use App\Models\BusinessSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BusinessSettingController extends Controller
{
    /**
     * Mostrar la página de configuración del negocio
     */
    public function index()
    {
        $settings = BusinessSetting::current();
        
        return Inertia::render('ConfiguracionNegocio', [
            'settings' => $settings
        ]);
    }

    /**
     * Actualizar la configuración del negocio
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ], [
            'business_name.required' => 'El nombre del negocio es obligatorio',
            'email.email' => 'Ingrese un correo válido',
        ]);

        $settings = BusinessSetting::current();
        $settings->update($validated);

        return back()->with('success', 'Configuración actualizada correctamente');
    }

    /**
     * Subir logo del negocio
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,jpg,png|max:2048',
        ], [
            'logo.required' => 'Debe seleccionar una imagen',
            'logo.image' => 'El archivo debe ser una imagen',
            'logo.mimes' => 'La imagen debe ser JPG, JPEG o PNG',
            'logo.max' => 'La imagen no debe superar 2MB',
        ]);

        $settings = BusinessSetting::current();

        // Eliminar logo anterior si existe
        if ($settings->logo_path && Storage::exists('public/' . $settings->logo_path)) {
            Storage::delete('public/' . $settings->logo_path);
        }

        // Guardar nuevo logo
        $path = $request->file('logo')->store('logos', 'public');
        
        $settings->update([
            'logo_path' => $path
        ]);

        return back()->with('success', 'Logo actualizado correctamente');
    }
}
