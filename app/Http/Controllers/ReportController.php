<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // Rango de fechas (por defecto: últimos 30 días)
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // 1. Ventas Totales
        $totalSales = Sale::whereDate('created_at', '>=', $startDate)
                          ->whereDate('created_at', '<=', $endDate)
                          ->sum('total');
        
        // 2. Costo Total (Estimado via detalles)
        $totalCost = SaleDetail::whereHas('sale', function($q) use ($startDate, $endDate) {
                $q->whereDate('created_at', '>=', $startDate)->whereDate('created_at', '<=', $endDate);
            })->sum(DB::raw('cost * quantity'));
            
        $totalProfit = $totalSales - $totalCost;

        // 3. Productos más vendidos
        $topProducts = SaleDetail::select('product_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(line_total) as total_money'))
            ->whereHas('sale', function($q) use ($startDate, $endDate) {
                $q->whereDate('created_at', '>=', $startDate)->whereDate('created_at', '<=', $endDate);
            })
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // 4. Gráfico Ventas por Día
        $salesByDate = Sale::selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($sale) {
                return [
                    'name' => Carbon::parse($sale->date)->format('d/m'),
                    'ventas' => (float)$sale->total,
                ];
            });

        // 5. Conteo Stock Bajo (para KPI)
        $lowStockCount = Product::whereRaw('stock <= min_stock')->count();

        return Inertia::render('Reportes', [
            'filters' => ['start_date' => $startDate, 'end_date' => $endDate],
            'chartData' => $salesByDate,
            'topProducts' => $topProducts,
            'stats' => [
                'total_sales' => $totalSales,
                'total_profit' => $totalProfit,
                'low_stock' => $lowStockCount,
                'average_ticket' => Sale::whereDate('created_at', '>=', $startDate)->whereDate('created_at', '<=', $endDate)->avg('total') ?? 0
            ]
        ]);
    }

    // ✅ MÉTODO CRÍTICO PARA "BAJA EXISTENCIA"
    public function inventarioBajo()
    {
        // Busca productos donde el stock sea menor o igual al mínimo definido
        $products = Product::with('category')
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock', 'asc')
            ->get();

        return Inertia::render('Reportes/BajaExistencia', [
            'productos' => $products
        ]);
    }
}