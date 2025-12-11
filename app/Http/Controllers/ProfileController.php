<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Actualizar información del perfil del usuario (solo administradores)
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        // SOLO LOS ADMINISTRADORES PUEDEN ACTUALIZAR SU PERFIL
        if ($user->role !== 'admin') {
            return back()->withErrors([
                'general' => 'Los vendedores no pueden modificar su perfil. Contacte a un administrador.'
            ])->with('error', 'Acceso denegado');
        }
        
        // Validación básica
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        // Actualizar datos básicos
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        return back()->with('success', 'Perfil actualizado correctamente');
    }

    /**
     * Actualizar contraseña (solo para administradores)
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        // SOLO LOS ADMINISTRADORES PUEDEN CAMBIAR SU CONTRASEÑA
        if ($user->role !== 'admin') {
            return back()->withErrors([
                'password' => 'Los vendedores no pueden cambiar su contraseña. Contacte a un administrador.'
            ])->with('error', 'Acceso denegado');
        }

        // Validación
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'confirmed', Password::min(6)],
        ]);

        // Verificar contraseña actual
        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'current_password' => 'La contraseña actual no es correcta'
            ]);
        }

        // Actualizar contraseña
        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return back()->with('success', 'Contraseña actualizada correctamente');
    }
}
