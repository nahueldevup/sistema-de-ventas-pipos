<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'phone'];

    // Relación: Un cliente tiene muchas compras (ventas)
    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}