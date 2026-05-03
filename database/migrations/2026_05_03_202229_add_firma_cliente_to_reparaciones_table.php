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
        Schema::table('reparaciones', function (Blueprint $table) {
            // Añadimos el campo de la firma.
            // - longText: Porque las imágenes en Base64 ocupan muchísimos caracteres.
            // - nullable(): Para que los avisos antiguos que no tienen firma no den error.
            $table->longText('firma_cliente')->nullable()->after('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reparaciones', function (Blueprint $table) {
            // Si hacemos un rollback, eliminamos solo esta columna
            $table->dropColumn('firma_cliente');
        });
    }
};
