<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear Usuario Admin (Si no existe)
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Administrador',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'active' => true
            ]
        );

        // 2. Llamar al seeder de productos (que también crea categorías)
        $this->call([
            ProductSeeder::class,
            // ClientSeeder::class, // Descomenta si creas uno para clientes
        ]);
    }
}