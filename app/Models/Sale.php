<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sale_number',
        'client_id',
        'user_id',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total',
        'payment_method',
        'amount_paid',
        'change_amount'
    ];

    // Relación con los detalles (items vendidos)
    public function details()
    {
        return $this->hasMany(SaleDetail::class);
    }

    // Relación con el Cliente
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Relación con el Vendedor
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}