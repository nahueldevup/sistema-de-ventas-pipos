<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Listar todos los usuarios
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('ConfiguracionUsuarios', [
            'users' => $users
        ]);
    }

    /**
     * Crear un nuevo usuario
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['admin', 'vendedor'])],
        ], [
            'name.required' => 'El nombre es obligatorio',
            'email.required' => 'El correo es obligatorio',
            'email.email' => 'Ingrese un correo válido',
            'email.unique' => 'Este correo ya está registrado',
            'password.required' => 'La contraseña es obligatoria',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres',
            'role.required' => 'El rol es obligatorio',
            'role.in' => 'El rol debe ser admin o vendedor',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'active' => true,
        ]);

        return back()->with('success', 'Usuario creado correctamente');
    }

    /**
     * Actualizar un usuario existente
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['admin', 'vendedor'])],
        ], [
            'name.required' => 'El nombre es obligatorio',
            'email.required' => 'El correo es obligatorio',
            'email.email' => 'Ingrese un correo válido',
            'email.unique' => 'Este correo ya está registrado',
            'role.required' => 'El rol es obligatorio',
            'role.in' => 'El rol debe ser admin o vendedor',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ]);

        return back()->with('success', 'Usuario actualizado correctamente');
    }

    /**
     * Eliminar un usuario (soft delete)
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Evitar que el usuario se elimine a sí mismo
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes eliminar tu propia cuenta']);
        }

        $user->delete();

        return back()->with('success', 'Usuario eliminado correctamente');
    }

    /**
     * Alternar el estado activo/inactivo de un usuario
     */
    public function toggleActive($id)
    {
        $user = User::findOrFail($id);
        
        // Evitar que el usuario se desactive a sí mismo
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes desactivar tu propia cuenta']);
        }

        $user->update([
            'active' => !$user->active
        ]);

        $status = $user->active ? 'activado' : 'desactivado';
        return back()->with('success', "Usuario {$status} correctamente");
    }

    /**
     * Cambiar la contraseña de un usuario
     */
    public function updatePassword(Request $request, $id)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ], [
            'password.required' => 'La contraseña es obligatoria',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres',
            'password.confirmed' => 'Las contraseñas no coinciden',
        ]);

        $user = User::findOrFail($id);
        
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Contraseña actualizada correctamente');
    }

    /**
     * Actualizar permisos de un usuario
     */
    public function updatePermissions(Request $request, $id)
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|in:inicio,vender,productos,clientes,caja,reportes,configuracion',
        ]);

        $user = User::findOrFail($id);
        
        $user->update([
            'permissions' => $validated['permissions'],
        ]);

        return back()->with('success', 'Permisos actualizados correctamente');
    }
}
