<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashCount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sales_cash',
        'sales_digital',
        'manual_incomes',
        'manual_expenses',
        'expected_cash',
        'counted_cash',
        'difference',
        'notes'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}