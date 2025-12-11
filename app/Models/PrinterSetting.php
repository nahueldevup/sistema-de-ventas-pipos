<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrinterSetting extends Model
{
    protected $fillable = [
        'printer_name',
        'printer_type',
        'auto_print',
        'paper_width',
        'paper_height',
        'show_logo',
        'show_business_info',
        'header_message',
        'footer_message',
        'paper_size',
    ];

    protected $casts = [
        'auto_print' => 'boolean',
        'show_logo' => 'boolean',
        'show_business_info' => 'boolean',
        'paper_width' => 'integer',
        'paper_height' => 'integer',
    ];
}
