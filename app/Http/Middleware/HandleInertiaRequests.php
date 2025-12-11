<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

  public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'permissions' => $request->user()->permissions,
            ] : null,
        ],
        // --- AQUÍ ESTÁ EL CAMBIO ---
        'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
            'sale_id' => $request->session()->get('sale_id'), // <--- AGREGAR ESTA LÍNEA
        ],
        // ---------------------------
        'businessSettings' => \App\Models\BusinessSetting::first(),
        'printerSettings' => \App\Models\PrinterSetting::first(),
    ]);
}
}