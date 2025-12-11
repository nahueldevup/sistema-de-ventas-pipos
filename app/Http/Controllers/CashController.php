<?php

namespace App\Http\Controllers;

use App\Models\CashMovement;
use App\Models\Sale;
use App\Models\CashCount; // <--- Asegúrate de tener este Modelo creado
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CashController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        // 1. Movimientos del día
        $movements = CashMovement::with('user')
            ->whereDate('created_at', $today)
            ->orderBy('created_at', 'desc')
            ->get();

        // 2. Historial de Cierres (Recuperamos los últimos 10)
        $history = CashCount::with('user')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();
        
        return Inertia::render('Caja', [
            'movements' => $movements,
            'summary' => $this->calculateDailySummary($today),
            'history' => $history // <--- Enviamos el historial a la vista
        ]);
    }

    // Guardar movimiento manual (Ingreso/Egreso)
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'type' => 'required|in:ingreso,egreso',
        ]);
        
        CashMovement::create([
            'type' => $request->type,
            'amount' => $request->amount,
            'description' => $request->description,
            'user_id' => Auth::id() ?? 1
        ]);

        return redirect()->back()->with('success', 'Movimiento registrado');
    }

    // --- NUEVO: Guardar el Arqueo/Cierre en la BD ---
    public function storeCierre(Request $request)
    {
        $request->validate([
            'counted_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        $today = Carbon::today();
        $summary = $this->calculateDailySummary($today);
        
        // Calculamos la diferencia final
        $counted = $request->counted_cash;
        $difference = $counted - $summary['expected_cash'];

        CashCount::create([
            'user_id' => Auth::id() ?? 1,
            'sales_cash' => $summary['sales_cash'],
            'sales_digital' => $summary['sales_digital'],
            'manual_incomes' => $summary['manual_incomes'],
            'manual_expenses' => $summary['manual_expenses'],
            'expected_cash' => $summary['expected_cash'],
            'counted_cash' => $counted,
            'difference' => $difference,
            'notes' => $request->notes
        ]);

        return redirect()->back()->with('success', 'Cierre guardado correctamente');
    }
    
    /**
     * Ver el detalle de un cierre histórico
     */
    public function show($id)
    {
        $cierre = CashCount::with('user')->findOrFail($id);
        
        // Buscamos los movimientos que ocurrieron en la fecha del cierre
        $movements = CashMovement::with('user')
            ->whereDate('created_at', $cierre->created_at)
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('CajaDetalle', [
            'cierre' => $cierre,
            'movements' => $movements
        ]);
    }

    public function destroy($id)
    {
        $movement = CashMovement::findOrFail($id);
        $movement->delete();
        return redirect()->back()->with('success', 'Movimiento eliminado');
    }

    public function cierreCaja()
    {
        $today = Carbon::today();
        return response()->json($this->calculateDailySummary($today));
    }

    private function calculateDailySummary($date)
    {
        $salesCash = Sale::whereDate('created_at', $date)->where('payment_method', 'efectivo')->sum('total');
        $salesTransfer = Sale::whereDate('created_at', $date)->where('payment_method', 'transferencia')->sum('total');
        $salesCard = Sale::whereDate('created_at', $date)->where('payment_method', 'tarjeta')->sum('total');

        $incomes = CashMovement::whereDate('created_at', $date)->where('type', 'ingreso')->sum('amount');
        $expenses = CashMovement::whereDate('created_at', $date)->where('type', 'egreso')->sum('amount');

        return [
            'sales_cash' => (float) $salesCash,
            'sales_digital' => (float) ($salesTransfer + $salesCard),
            'manual_incomes' => (float) $incomes,
            'manual_expenses' => (float) $expenses,
            'expected_cash' => (float) ($salesCash + $incomes - $expenses),
            'total_sales_day' => (float) ($salesCash + $salesTransfer + $salesCard)
        ];
    }
}