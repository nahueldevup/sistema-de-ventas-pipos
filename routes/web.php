<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\CashController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PrinterSettingController;
use App\Http\Controllers\BusinessSettingController;
use App\Http\Controllers\ProfileController;

// --- RUTAS PÚBLICAS (Autenticación) ---
Route::get('/login', function () { 
    return Inertia::render('Login'); 
})->name('login');

Route::get('/register', function () { 
    return Inertia::render('Register'); 
})->name('register');

Route::post('/register', [AuthController::class, 'register'])->name('register.post');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// --- RUTAS PROTEGIDAS (Requieren autenticación, usuario activo y permisos) ---
Route::middleware(['auth', 'active', 'permission'])->group(function () {

    // --- DASHBOARD ---
    Route::get('/', function () {
        $lowStockProducts = \App\Models\Product::whereRaw('stock <= min_stock')
            ->get(['id', 'description', 'stock', 'min_stock']);
            
        return Inertia::render('Dashboard', [
            'lowStockProducts' => $lowStockProducts
        ]);
    })->name('dashboard');

    // --- PERFIL DE USUARIO ---
    Route::get('/perfil', function () {
        return Inertia::render('Perfil');
    })->name('profile.index');
    Route::put('/perfil', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/perfil/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    // --- CATEGORÍAS ---
    Route::post('/categorias', [CategoryController::class, 'store'])->name('categories.store');
    Route::delete('/categorias/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // --- PRODUCTOS ---
    Route::get('/productos/export', [ProductController::class, 'export'])->name('products.export');
    Route::post('/productos/import', [ProductController::class, 'import'])->name('products.import');
    Route::get('/productos/plantilla', [ProductController::class, 'downloadTemplate'])->name('products.template');
    Route::get('/productos', [ProductController::class, 'index'])->name('products.index');
    Route::post('/productos', [ProductController::class, 'store'])->name('products.store');
    Route::put('/productos/{id}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/productos/{id}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::post('/productos/{id}/stock', [ProductController::class, 'updateStock'])->name('products.stock');

    // --- VENTAS ---
    Route::get('/vender', [SaleController::class, 'index'])->name('sales.index');
    Route::post('/vender', [SaleController::class, 'store'])->name('sales.store');
    Route::get('/ventas/{id}', [SaleController::class, 'show'])->name('sales.show');
    Route::delete('/ventas/{id}', [SaleController::class, 'destroy'])->name('sales.destroy');
    Route::get('/api/ventas/{id}/ticket', [SaleController::class, 'getTicket'])->name('api.sales.ticket');

    // --- CLIENTES ---
    Route::get('/clientes', [ClientController::class, 'index'])->name('clients.index');
    Route::post('/clientes', [ClientController::class, 'store'])->name('clients.store');
    Route::get('/clientes/{id}', [ClientController::class, 'show'])->name('clients.show');
    Route::put('/clientes/{id}', [ClientController::class, 'update'])->name('clients.update');
    Route::delete('/clientes/{id}', [ClientController::class, 'destroy'])->name('clients.destroy');
    Route::get('/api/clientes/search', [ClientController::class, 'search'])->name('clients.search');

    // --- CAJA ---
    Route::get('/caja', [CashController::class, 'index'])->name('cash.index');
    Route::post('/caja', [CashController::class, 'store'])->name('cash.store');
    Route::get('/caja/cierre', [CashController::class, 'cierreCaja'])->name('cash.cierre'); 
    Route::post('/caja/cierre', [CashController::class, 'storeCierre'])->name('cash.save_cierre');
    Route::delete('/caja/{id}', [CashController::class, 'destroy'])->name('cash.destroy');
    Route::get('/caja/historial/{id}', [CashController::class, 'show'])->name('cash.show');

    // --- CONFIGURACIÓN > USUARIOS Y PERMISOS ---
    Route::prefix('configuracion/usuarios')->group(function() {
        Route::get('/', [UserController::class, 'index'])->name('config.users.index');
        Route::post('/', [UserController::class, 'store'])->name('config.users.store');
        Route::put('/{id}', [UserController::class, 'update'])->name('config.users.update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('config.users.destroy');
        Route::patch('/{id}/toggle-active', [UserController::class, 'toggleActive'])->name('config.users.toggle');
        Route::put('/{id}/password', [UserController::class, 'updatePassword'])->name('config.users.password');
        Route::put('/{id}/permissions', [UserController::class, 'updatePermissions'])->name('config.users.permissions');
    });

    // --- CONFIGURACIÓN > DATOS DEL NEGOCIO ---
    Route::prefix('configuracion/negocio')->group(function() {
        Route::get('/', [BusinessSettingController::class, 'index'])->name('config.business.index');
        Route::put('/', [BusinessSettingController::class, 'update'])->name('config.business.update');
        Route::post('/logo', [BusinessSettingController::class, 'uploadLogo'])->name('config.business.upload-logo');
    });

    // --- CONFIGURACIÓN > IMPRESORAS Y TICKETS ---
    Route::prefix('configuracion/tickets')->group(function() {
        Route::get('/', [PrinterSettingController::class, 'index'])->name('config.tickets.index');
        Route::put('/', [PrinterSettingController::class, 'update'])->name('config.tickets.update');
    });

    // --- REPORTES ---
    Route::prefix('reportes')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/ventas-contado', [SaleController::class, 'history'])->name('reports.sales');
        Route::get('/baja-existencia', [ReportController::class, 'inventarioBajo'])->name('reports.low_stock');
    });

    // --- FALLBACK 404 ---
    Route::fallback(function () {
        return Inertia::render('NotFound');
    });

});
