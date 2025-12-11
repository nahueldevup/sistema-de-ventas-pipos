<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessSetting extends Model
{
    protected $fillable = [
        'business_name',
        'tax_id',
        'address',
        'phone',
        'email',
        'logo_path',
    ];

    /**
     * Obtener la configuración actual del negocio (siempre hay solo 1 registro)
     */
    public static function current()
    {
        return static::first() ?? static::create([
            'business_name' => 'Mi Negocio',
        ]);
    }
}
