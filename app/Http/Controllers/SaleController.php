<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Product;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SaleController extends Controller
{
    /**
     * Mostrar pantalla de punto de venta
     */
    public function index()
    {
        return Inertia::render('Vender', [
            'allProducts' => Product::where('stock', '>', 0)
                ->with('category')
                ->orderBy('description')
                ->get(),
            'clients' => Client::orderBy('name')->get(), //Agregado para selector de clientes
        ]);
    }

    /**
     * Procesar una nueva venta
     */
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.salePrice' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:efectivo,tarjeta,transferencia',
            'amount_received' => 'nullable|numeric|min:0',
            'client_id' => 'nullable|exists:clients,id',
            'client_name' => 'nullable|string|max:255',
            'client_phone' => 'nullable|string|max:20',
        ]);

        try {
            $sale = DB::transaction(function () use ($request) {
                // 1. Gestión de Cliente
                $clientId = null;
                if ($request->client_name) {
                    $client = Client::firstOrCreate(
                        ['name' => $request->client_name],
                        ['phone' => $request->client_phone]
                    );
                    $clientId = $client->id;
                } elseif ($request->client_id) {
                    $clientId = $request->client_id;
                }

                // 2. Cálculos (Backend es la autoridad)
                $subtotal = 0;
                $totalTax = 0;
                $itemsData = [];

                foreach ($request->items as $item) {
                    $product = Product::findOrFail($item['id']);
                    
                    //Validar stock suficiente
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stock insuficiente para: {$product->description}. Disponible: {$product->stock}");
                    }
                    
                    $unitPrice = $item['salePrice']; 
                    $quantity = $item['quantity'];
                    $lineTotal = $unitPrice * $quantity;
                    
                    $subtotal += $lineTotal;

                    $itemsData[] = [
                        'product' => $product,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'line_total' => $lineTotal,
                    ];
                }

                $total = $subtotal + $totalTax;
                $amountPaid = $request->amount_received ?? $total;
                $change = $amountPaid - $total;

                // 3. Crear Venta
                $sale = Sale::create([
                    'sale_number' => 'V-' . strtoupper(Str::random(8)),
                    'user_id' => Auth::id() ?? 1,
                    'client_id' => $clientId,
                    'subtotal' => $subtotal,
                    'tax_amount' => $totalTax,
                    'total' => $total,
                    'payment_method' => $request->payment_method,
                    'amount_paid' => $amountPaid,
                    'change_amount' => max(0, $change),
                ]);

                // 4. Crear Detalles y Descontar Stock
                foreach ($itemsData as $data) {
                    $product = $data['product'];

                    SaleDetail::create([
                        'sale_id' => $sale->id,
                        'product_id' => $product->id,
                        'product_barcode' => $product->barcode,
                        'product_name' => $product->description,
                        'cost' => $product->purchase_price,
                        'quantity' => $data['quantity'],
                        'unit_price' => $data['unit_price'],
                        'line_total' => $data['line_total'],
                    ]);

                    //Descontar Stock
                    $product->decrement('stock', $data['quantity']);
                }
                return $sale;
            });

            return redirect()->back()->with('success', 'Venta registrada correctamente')->with('sale_id', $sale->id);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Historial de ventas
     */
    public function history(Request $request)
    {
        $query = Sale::with(['user', 'client', 'details'])
                     ->orderBy('created_at', 'desc');

        //Filtros opcionales
        if ($request->has('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }
        if ($request->has('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }

        $sales = $query->get()->map(function($sale) {
            //Calcular utilidad real (total venta - costo histórico)
            $utilidad = $sale->details->sum(function($detail) {
                return ($detail->unit_price - $detail->cost) * $detail->quantity;
            });

            return [
                'id' => $sale->id,
                'folio' => $sale->sale_number,
                'monto' => $sale->total,
                'utilidad' => $utilidad,
                'fecha' => $sale->created_at->format('d/m/Y H:i'),
                'cliente' => $sale->client->name ?? 'Público General',
                'usuario' => $sale->user->name ?? 'Sistema',
                'metodo_pago' => $sale->payment_method,
            ];
        });

        return Inertia::render('VentasContado', ['ventas' => $sales]);
    }

    /**
     * Ver detalle de una venta específica
     */
   /**
     * Ver detalle de una venta específica
     */
    public function show($id)
    {
        $sale = Sale::with(['user', 'client', 'details.product'])
                    ->findOrFail($id);

        return Inertia::render('VentaDetalle', [
            'venta' => [
                'id' => $sale->id,
                'folio' => $sale->sale_number ?? 'N/A',
                'fecha' => $sale->created_at->format('d/m/Y H:i:s'),
                'cliente' => $sale->client ? [
                    'nombre' => $sale->client->name,
                    'telefono' => $sale->client->phone ?? null,
                ] : null,
                'usuario' => $sale->user->name ?? 'Sistema',
                'subtotal' => (float) $sale->subtotal,
                'impuestos' => (float) $sale->tax_amount,
                'total' => (float) $sale->total,
                'metodo_pago' => $sale->payment_method ?? 'efectivo',
                'monto_pagado' => (float) $sale->amount_paid,
                'cambio' => (float) $sale->change_amount,
                'detalles' => $sale->details->map(function($detail) {
                    return [
                        'producto' => $detail->product_name,
                        'codigo' => $detail->product_barcode ?? 'S/C',
                        'cantidad' => (int) $detail->quantity,
                        'precio_unitario' => (float) $detail->unit_price,
                        'costo' => (float) $detail->cost,
                        'total' => (float) $detail->line_total,
                        'utilidad' => (float) (($detail->unit_price - $detail->cost) * $detail->quantity),
                    ];
                })->values()->toArray(),
            ]
        ]);
    }
    public function getTicket($id)
    {
        $sale = Sale::with(['user', 'client', 'details'])->findOrFail($id);
        
        return response()->json([
            'folio' => $sale->sale_number,
            'fecha' => $sale->created_at->format('d/m/Y H:i'),
            'cliente' => $sale->client->name ?? 'Público General',
            'cajero' => $sale->user->name,
            'items' => $sale->details->map(function($d) {
                return [
                    'descripcion' => $d->product_name,
                    'cantidad' => $d->quantity,
                    'precio' => (float)$d->unit_price,
                    'total' => (float)$d->line_total
                ];
            }),
            'subtotal' => (float)$sale->subtotal,
            'total' => (float)$sale->total,
            'pago' => (float)$sale->amount_paid,
            'cambio' => (float)$sale->change_amount,
            'metodo_pago' => $sale->payment_method
        ]);
    }

    /**
     * Anular una venta (soft delete)
     */
    public function destroy($id)
    {
        try {
            DB::transaction(function () use ($id) {
                $sale = Sale::findOrFail($id);
                
                //Devolver stock a inventario
                foreach ($sale->details as $detail) {
                    if ($detail->product) {
                        $detail->product->increment('stock', $detail->quantity);
                    }
                }

                //Soft delete de la venta
                $sale->delete();
            });

            return redirect()->back()->with('success', 'Venta anulada correctamente. Stock restaurado.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al anular venta: ' . $e->getMessage()]);
        }
    }
}