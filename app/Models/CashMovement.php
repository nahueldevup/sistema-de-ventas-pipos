<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 
        'amount', 
        'description', 
        'user_id'
    ];

    // Relación: Un movimiento pertenece a un usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}