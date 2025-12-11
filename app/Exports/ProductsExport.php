<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Product::with('category')->get();
    }

    public function headings(): array
    {
        return [
            'Código de Barras',
            'Descripción',
            'Categoría',
            'Precio Compra',
            'Precio Venta',
            'Stock',
            'Stock Mínimo',
        ];
    }

    public function map($product): array
    {
        return [
            $product->barcode ?? '',
            $product->description,
            $product->category->name ?? '',
            $product->purchase_price,
            $product->sale_price,
            $product->stock,
            $product->min_stock,
        ];
    }
}
