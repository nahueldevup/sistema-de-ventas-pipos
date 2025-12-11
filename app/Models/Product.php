<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'barcode',
        'description',
        'purchase_price',
        'sale_price',
        'stock',
        'min_stock',
        'category_id'
    ];

    // Relación: Un producto pertenece a una categoría
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    
    // Relación: Un producto puede estar en muchos detalles de venta
    public function saleDetails()
    {
        return $this->hasMany(SaleDetail::class);
    }
}