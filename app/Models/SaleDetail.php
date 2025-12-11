<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'product_id',
        'product_barcode',
        'product_name',     // Snapshot
        'quantity',
        'unit_price',       // Snapshot
        'cost',             // Snapshot
        'discount_amount',
        'line_total'
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed(); // withTrashed permite ver productos borrados
    }
}