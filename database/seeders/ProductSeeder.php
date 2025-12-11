<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Asegurar Categorías
        $cats = [
            'Bebidas' => Category::firstOrCreate(['name' => 'Bebidas'])->id,
            'Abarrotes' => Category::firstOrCreate(['name' => 'Abarrotes'])->id,
            'Lácteos' => Category::firstOrCreate(['name' => 'Lácteos'])->id,
            'Carnes y Embutidos' => Category::firstOrCreate(['name' => 'Carnes y Embutidos'])->id,
            'Limpieza' => Category::firstOrCreate(['name' => 'Limpieza'])->id,
            'Higiene Personal' => Category::firstOrCreate(['name' => 'Higiene Personal'])->id,
            'Snacks y Dulces' => Category::firstOrCreate(['name' => 'Snacks y Dulces'])->id,
            'Farmacia' => Category::firstOrCreate(['name' => 'Farmacia'])->id,
        ];

        // 2. Lista Masiva de 50 Productos
        $productos = [
            // --- BEBIDAS ---
            ['code'=>'7501055300075', 'name'=>'Coca Cola 600ml', 'buy'=>12.00, 'sell'=>18.00, 'cat'=>'Bebidas', 'stock'=>100],
            ['code'=>'7501055310807', 'name'=>'Coca Cola 2.5L Retornable', 'buy'=>28.00, 'sell'=>35.00, 'cat'=>'Bebidas', 'stock'=>40],
            ['code'=>'7501031311609', 'name'=>'Pepsi 600ml', 'buy'=>11.00, 'sell'=>16.00, 'cat'=>'Bebidas', 'stock'=>50],
            ['code'=>'7501000000010', 'name'=>'Agua Ciel 1L', 'buy'=>8.00, 'sell'=>12.00, 'cat'=>'Bebidas', 'stock'=>80],
            ['code'=>'7501000000011', 'name'=>'Jugo Del Valle Manzana 413ml', 'buy'=>10.00, 'sell'=>15.00, 'cat'=>'Bebidas', 'stock'=>30],
            ['code'=>'7501000000012', 'name'=>'Powerade Moras 600ml', 'buy'=>14.00, 'sell'=>20.00, 'cat'=>'Bebidas', 'stock'=>25],
            ['code'=>'7501000000013', 'name'=>'Cerveza Corona Latón 473ml', 'buy'=>18.00, 'sell'=>25.00, 'cat'=>'Bebidas', 'stock'=>120],

            // --- ABARROTES ---
            ['code'=>'7501000000020', 'name'=>'Aceite 1-2-3 1L', 'buy'=>38.00, 'sell'=>48.00, 'cat'=>'Abarrotes', 'stock'=>20],
            ['code'=>'7501000000021', 'name'=>'Arroz La Merced 900g', 'buy'=>18.00, 'sell'=>24.00, 'cat'=>'Abarrotes', 'stock'=>35],
            ['code'=>'7501000000022', 'name'=>'Frijol Negro Verde Valle 1kg', 'buy'=>28.00, 'sell'=>36.00, 'cat'=>'Abarrotes', 'stock'=>5], // Stock Bajo
            ['code'=>'7501000000023', 'name'=>'Azúcar Estándar 1kg', 'buy'=>22.00, 'sell'=>28.00, 'cat'=>'Abarrotes', 'stock'=>40],
            ['code'=>'7501000000024', 'name'=>'Sal La Fina 1kg', 'buy'=>12.00, 'sell'=>16.00, 'cat'=>'Abarrotes', 'stock'=>50],
            ['code'=>'7501000000025', 'name'=>'Atún Dolores Agua 140g', 'buy'=>15.00, 'sell'=>21.00, 'cat'=>'Abarrotes', 'stock'=>60],
            ['code'=>'7501000000026', 'name'=>'Mayonesa McCormick 390g', 'buy'=>28.00, 'sell'=>38.00, 'cat'=>'Abarrotes', 'stock'=>15],
            ['code'=>'7501000000027', 'name'=>'Pasta Spaghetti La Moderna 200g', 'buy'=>7.00, 'sell'=>11.00, 'cat'=>'Abarrotes', 'stock'=>100],
            ['code'=>'7501000000028', 'name'=>'Puré de Tomate Del Fuerte 210g', 'buy'=>6.00, 'sell'=>9.00, 'cat'=>'Abarrotes', 'stock'=>45],
            ['code'=>'7501000000029', 'name'=>'Café Nescafé Clásico 225g', 'buy'=>85.00, 'sell'=>110.00, 'cat'=>'Abarrotes', 'stock'=>10],
            ['code'=>'7501000000030', 'name'=>'Cereal Zucaritas 700g', 'buy'=>55.00, 'sell'=>75.00, 'cat'=>'Abarrotes', 'stock'=>8], // Stock Bajo
            ['code'=>'7501000000031', 'name'=>'Harina de Trigo Selecta 1kg', 'buy'=>16.00, 'sell'=>22.00, 'cat'=>'Abarrotes', 'stock'=>20],
            ['code'=>'7501000000032', 'name'=>'Galletas Marías Gamesa 144g', 'buy'=>10.00, 'sell'=>15.00, 'cat'=>'Abarrotes', 'stock'=>30],

            // --- LÁCTEOS ---
            ['code'=>'7501020542306', 'name'=>'Leche Lala Entera 1L', 'buy'=>22.00, 'sell'=>27.00, 'cat'=>'Lácteos', 'stock'=>2], // Crítico
            ['code'=>'7501000000040', 'name'=>'Leche Alpura Deslactosada 1L', 'buy'=>23.00, 'sell'=>28.00, 'cat'=>'Lácteos', 'stock'=>24],
            ['code'=>'7501000000041', 'name'=>'Nutri Leche 1L', 'buy'=>17.00, 'sell'=>21.00, 'cat'=>'Lácteos', 'stock'=>50],
            ['code'=>'7501000000042', 'name'=>'Yogurt Yoplait Fresa 1kg', 'buy'=>32.00, 'sell'=>42.00, 'cat'=>'Lácteos', 'stock'=>10],
            ['code'=>'7501000000043', 'name'=>'Queso Panela Fud 400g', 'buy'=>45.00, 'sell'=>60.00, 'cat'=>'Lácteos', 'stock'=>5], // Stock Bajo
            ['code'=>'7501000000044', 'name'=>'Crema Ácida Lala 200ml', 'buy'=>14.00, 'sell'=>19.00, 'cat'=>'Lácteos', 'stock'=>15],
            ['code'=>'7501000000045', 'name'=>'Mantequilla Gloria 90g', 'buy'=>18.00, 'sell'=>24.00, 'cat'=>'Lácteos', 'stock'=>12],

            // --- CARNES Y EMBUTIDOS ---
            ['code'=>'7501000000050', 'name'=>'Jamón Virginia Fud 290g', 'buy'=>35.00, 'sell'=>48.00, 'cat'=>'Carnes y Embutidos', 'stock'=>8],
            ['code'=>'7501000000051', 'name'=>'Salchicha Viena Kir 500g', 'buy'=>30.00, 'sell'=>42.00, 'cat'=>'Carnes y Embutidos', 'stock'=>10],
            ['code'=>'7501000000052', 'name'=>'Chorizo Ranchero 250g', 'buy'=>20.00, 'sell'=>28.00, 'cat'=>'Carnes y Embutidos', 'stock'=>15],

            // --- SNACKS ---
            ['code'=>'7501011115655', 'name'=>'Sabritas Sal 45g', 'buy'=>13.00, 'sell'=>18.00, 'cat'=>'Snacks y Dulces', 'stock'=>20],
            ['code'=>'7501000142320', 'name'=>'Doritos Nacho 58g', 'buy'=>14.00, 'sell'=>19.00, 'cat'=>'Snacks y Dulces', 'stock'=>25],
            ['code'=>'7501000000060', 'name'=>'Ruffles Queso 50g', 'buy'=>14.00, 'sell'=>19.00, 'cat'=>'Snacks y Dulces', 'stock'=>20],
            ['code'=>'7501000000061', 'name'=>'Cheetos Torciditos 52g', 'buy'=>12.00, 'sell'=>17.00, 'cat'=>'Snacks y Dulces', 'stock'=>30],
            ['code'=>'7501000000062', 'name'=>'Galletas Emperador Chocolate', 'buy'=>15.00, 'sell'=>20.00, 'cat'=>'Snacks y Dulces', 'stock'=>18],
            ['code'=>'7501000000063', 'name'=>'Chokis Clásicas 76g', 'buy'=>14.00, 'sell'=>19.00, 'cat'=>'Snacks y Dulces', 'stock'=>22],
            ['code'=>'7501000000064', 'name'=>'Mazapán De La Rosa', 'buy'=>4.00, 'sell'=>8.00, 'cat'=>'Snacks y Dulces', 'stock'=>100],
            ['code'=>'7501000000065', 'name'=>'Gansito Marinela', 'buy'=>12.00, 'sell'=>18.00, 'cat'=>'Snacks y Dulces', 'stock'=>15],

            // --- LIMPIEZA ---
            ['code'=>'7501000000070', 'name'=>'Cloro Cloralex 1L', 'buy'=>12.00, 'sell'=>18.00, 'cat'=>'Limpieza', 'stock'=>30],
            ['code'=>'7501000000071', 'name'=>'Detergente Ace Polvo 900g', 'buy'=>25.00, 'sell'=>35.00, 'cat'=>'Limpieza', 'stock'=>20],
            ['code'=>'7501000000072', 'name'=>'Suavitel Primaveral 850ml', 'buy'=>22.00, 'sell'=>30.00, 'cat'=>'Limpieza', 'stock'=>15],
            ['code'=>'7501000000073', 'name'=>'Jabón Zote Rosa 400g', 'buy'=>16.00, 'sell'=>22.00, 'cat'=>'Limpieza', 'stock'=>40],
            ['code'=>'7501000000074', 'name'=>'Lavastes Axion Limón 400ml', 'buy'=>18.00, 'sell'=>25.00, 'cat'=>'Limpieza', 'stock'=>25],
            ['code'=>'7501000000075', 'name'=>'Papel Higiénico Pétalo 4 rollos', 'buy'=>20.00, 'sell'=>28.00, 'cat'=>'Limpieza', 'stock'=>18],
            ['code'=>'7501000000076', 'name'=>'Servilletas Kleenex 500pz', 'buy'=>35.00, 'sell'=>45.00, 'cat'=>'Limpieza', 'stock'=>12],

            // --- HIGIENE PERSONAL ---
            ['code'=>'7501000000080', 'name'=>'Shampoo Head & Shoulders 375ml', 'buy'=>55.00, 'sell'=>75.00, 'cat'=>'Higiene Personal', 'stock'=>10],
            ['code'=>'7501000000081', 'name'=>'Jabón Tocador Palmolive 150g', 'buy'=>12.00, 'sell'=>18.00, 'cat'=>'Higiene Personal', 'stock'=>30],
            ['code'=>'7501000000082', 'name'=>'Pasta Dental Colgate 100ml', 'buy'=>25.00, 'sell'=>35.00, 'cat'=>'Higiene Personal', 'stock'=>20],
            ['code'=>'7501000000083', 'name'=>'Desodorante Rexona Barra', 'buy'=>30.00, 'sell'=>45.00, 'cat'=>'Higiene Personal', 'stock'=>15],

            // --- FARMACIA ---
            ['code'=>'7501000000090', 'name'=>'Aspirina 500mg 40 tabs', 'buy'=>30.00, 'sell'=>45.00, 'cat'=>'Farmacia', 'stock'=>10],
            ['code'=>'7501000000091', 'name'=>'Alcohol Etílico 96° 1L', 'buy'=>40.00, 'sell'=>60.00, 'cat'=>'Farmacia', 'stock'=>8],
            ['code'=>'7501000000092', 'name'=>'Curitas Band-Aid 20pz', 'buy'=>20.00, 'sell'=>30.00, 'cat'=>'Farmacia', 'stock'=>15],
        ];

        // 3. Insertar en Base de Datos
        foreach ($productos as $p) {
            Product::updateOrCreate(
                ['barcode' => $p['code']], // Busca por código para no duplicar
                [
                    'description' => $p['name'],
                    'purchase_price' => $p['buy'],
                    'sale_price' => $p['sell'],
                    'category_id' => $cats[$p['cat']],
                    'stock' => $p['stock'],
                    'min_stock' => 10, // Mínimo estándar para alertas
                ]
            );
        }
    }
}
