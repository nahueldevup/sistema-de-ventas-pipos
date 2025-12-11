<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Listar todos los clientes con estadísticas
     */
    public function index()
    {
        $clients = Client::withCount('sales')
                        ->with(['sales' => function($query) {
                            $query->select('client_id')
                                  ->selectRaw('SUM(total) as total_gastado')
                                  ->groupBy('client_id');
                        }])
                        ->orderBy('name')
                        ->get()
                        ->map(function($client) {
                            $totalGastado = $client->sales->sum('total_gastado');
                            
                            return [
                                'id' => $client->id,
                                'name' => $client->name,
                                'phone' => $client->phone,
                                'total_compras' => $client->sales_count,
                                'total_gastado' => $totalGastado,
                                'created_at' => $client->created_at->format('d/m/Y'),
                            ];
                        });

        return Inertia::render('Clientes', [
            'clients' => $clients
        ]);
    }

    /**
     * Crear nuevo cliente
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        Client::create([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        return redirect()->back()->with('success', 'Cliente creado correctamente');
    }

    /**
     * Ver detalle de un cliente con historial completo
     */
    public function show($id)
    {
        $client = Client::with(['sales' => function($query) {
                            $query->with('details')->orderBy('created_at', 'desc');
                        }])
                        ->findOrFail($id);

        $totalComprado = $client->sales->sum('total');
        $ultimaCompra = $client->sales->first();

        return Inertia::render('ClienteDetalle', [
            'cliente' => [
                'id' => $client->id,
                'name' => $client->name,
                'phone' => $client->phone ?? null,
                'created_at' => $client->created_at->format('d/m/Y'),
                'total_comprado' => (float) $totalComprado,
                'total_compras' => $client->sales->count(),
                'ultima_compra' => $ultimaCompra ? $ultimaCompra->created_at->format('d/m/Y H:i') : 'Sin compras',
                'ventas' => $client->sales->map(function($sale) {
                    return [
                        'id' => $sale->id,
                        'folio' => $sale->sale_number ?? 'N/A',
                        'fecha' => $sale->created_at->format('d/m/Y H:i'),
                        'total' => (float) $sale->total,
                        'metodo_pago' => $sale->payment_method ?? 'efectivo',
                        'productos' => $sale->details ? $sale->details->count() : 0,
                    ];
                })->values()->toArray(),
            ]
        ]);
    }

    /**
     * Actualizar cliente
     */
    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $client->update([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        return redirect()->back()->with('success', 'Cliente actualizado correctamente');
    }

    /**
     * Eliminar cliente
     */
    public function destroy($id)
    {
        $client = Client::findOrFail($id);

        if ($client->sales()->count() > 0) {
            return redirect()->back()->withErrors([
                'error' => 'No se puede eliminar un cliente con ventas registradas'
            ]);
        }

        $client->delete();

        return redirect()->back()->with('success', 'Cliente eliminado correctamente');
    }

    /**
     * Buscar cliente por nombre o teléfono
     */
    public function search(Request $request)
    {
        $query = $request->input('q');
        
        $clients = Client::where('name', 'like', "%{$query}%")
                        ->orWhere('phone', 'like', "%{$query}%")
                        ->limit(10)
                        ->get(['id', 'name', 'phone']);

        return response()->json($clients);
    }
}