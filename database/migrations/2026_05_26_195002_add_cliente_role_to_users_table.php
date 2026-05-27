<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. Añado 'cliente' a las opciones del rol
        DB::statement("ALTER TABLE users MODIFY COLUMN rol ENUM('admin', 'tecnico', 'cliente') NOT NULL DEFAULT 'cliente'");

        // 2. Añado la columna para saber a qué empresa pertenece
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('cliente_id')->nullable()->after('rol');
            $table->foreign('cliente_id')->references('id')->on('clientes')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['cliente_id']);
            $table->dropColumn('cliente_id');
        });
        DB::statement("ALTER TABLE users MODIFY COLUMN rol ENUM('admin', 'tecnico') NOT NULL");
    }
};
