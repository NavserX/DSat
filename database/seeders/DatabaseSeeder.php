<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Marcas (Solo nombre)
        \App\Models\Marca::create(['nombre' => 'Konica']);
        \App\Models\Marca::create(['nombre' => 'HP']);
        \App\Models\Marca::create(['nombre' => 'Sharp']);

        // 2. Técnicos (Nombre y Email)
        \App\Models\Tecnico::create(['nombre' => 'Sergio Navarro', 'email' => 'taller@ofimaticadigital.es']);
        \App\Models\Tecnico::create(['nombre' => 'Jose Cabrera', 'email' => 'tecnico1.ods@gmail.com']);
        \App\Models\Tecnico::create(['nombre' => 'Alfonos Campos', 'email' => 'tecnico3.ods@gmail.com']);

        // 3. Clientes (Nombre, Empresa y Email)
        // ¡ASEGÚRATE DE QUE AQUÍ DIGA \App\Models\Cliente!
        for ($i = 1; $i <= 10; $i++) {
            \App\Models\Cliente::create([
                'nombre' => "Cliente $i",
                'empresa' => "Empresa S.A. $i",
                'email' => "contacto$i@cliente.com"
            ]);
        }
    }
}
