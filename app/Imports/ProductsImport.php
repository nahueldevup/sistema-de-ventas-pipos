<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ProductsImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Buscar o crear categoría
        $category = null;
        if (!empty($row['categoria'])) {
            $category = Category::firstOrCreate(
                ['name' => $row['categoria']]
            );
        }

        return new Product([
            'barcode' => $row['codigo_de_barras'] ?? null,
            'description' => $row['descripcion'],
            'category_id' => $category?->id,
            'purchase_price' => $row['precio_compra'] ?? 0,
            'sale_price' => $row['precio_venta'],
            'stock' => $row['stock'] ?? 0,
            'min_stock' => $row['stock_minimo'] ?? 0,
        ]);
    }

    public function rules(): array
    {
        return [
            'descripcion' => 'required|string',
            'precio_venta' => 'required|numeric|min:0',
            'precio_compra' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'descripcion.required' => 'La descripción es obligatoria',
            'precio_venta.required' => 'El precio de venta es obligatorio',
            'precio_venta.numeric' => 'El precio de venta debe ser un número',
        ];
    }
}
