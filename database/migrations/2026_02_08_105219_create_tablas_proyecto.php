<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('marcas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->timestamps();
        });

        // NOTA: Dejo esta tabla por si la necesito en un futuro para los tecnicos,
        // pero de momento el login y los avisos se enlazan con la tabla 'users'.
        Schema::create('tecnicos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('email')->unique();
            $table->timestamps();
        });

        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('email')->nullable();      // Ahora es opcional
            $table->string('telefono')->nullable();   // ¡Añadido!
            $table->string('direccion')->nullable();  // ¡Añadido!
            $table->string('empresa')->nullable();
            $table->timestamps();
        });

        Schema::create('reparaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marca_id')->constrained('marcas');
            // Referencia a la tabla users, ya que ahí está el login y el rol
            $table->foreignId('tecnico_id')->nullable()->constrained('users');
            $table->foreignId('cliente_id')->constrained('clientes');

            $table->text('descripcion')->nullable();
            $table->string('estado')->default('pendiente');

            // ¡Añadidos los campos para cerrar los avisos!
            $table->text('resolucion_texto')->nullable();
            $table->json('piezas_utilizadas')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Se borran en orden inverso para no romper las claves foráneas (relaciones)
        Schema::dropIfExists('reparaciones');
        Schema::dropIfExists('clientes');
        Schema::dropIfExists('tecnicos');
        Schema::dropIfExists('marcas');
    }
};
