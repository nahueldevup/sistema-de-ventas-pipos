<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Mapa de rutas a permisos requeridos
     */
    protected array $routePermissions = [
        '/vender' => 'vender',
        '/productos' => 'productos',
        '/clientes' => 'clientes',
        '/caja' => 'caja',
        '/reportes' => 'reportes',
        '/configuracion' => 'configuracion',
    ];

    /**
     * Verificar que el usuario tenga el permiso necesario para la ruta
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        // Admins tienen acceso total
        if ($user && $user->role === 'admin') {
            return $next($request);
        }

        // Verificar permisos para la ruta actual
        $path = '/' . $request->path();
        
        foreach ($this->routePermissions as $route => $permission) {
            if (str_starts_with($path, $route)) {
                $userPermissions = $user->permissions ?? [];
                
                if (!in_array($permission, $userPermissions)) {
                    // Redirigir al dashboard con mensaje de error
                    return redirect('/')->with('error', 'No tienes permiso para acceder a esta sección.');
                }
                break;
            }
        }

        return $next($request);
    }
}
