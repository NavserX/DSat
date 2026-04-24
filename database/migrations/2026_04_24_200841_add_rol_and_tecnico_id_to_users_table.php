<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('rol')->default('tecnico')->after('password');
            $table->unsignedBigInteger('tecnico_id')->nullable()->after('rol');

            // Relación con la tabla técnicos
            $table->foreign('tecnico_id')->references('id')->on('tecnicos')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tecnico_id']);
            $table->dropColumn(['rol', 'tecnico_id']);
        });
    }
};
