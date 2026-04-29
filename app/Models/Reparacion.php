<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reparacion extends Model
{
    protected $table = 'reparaciones';

    protected $fillable = [
        // 'marca_id', // Ya no lo uso, ahora asigno una de las maquinas que tiene el cliente
        'tecnico_id',
        'cliente_id',
        'maquina_id',
        'descripcion',
        'fecha_entrada',
        'estado',
        'resolucion_texto',
        'piezas_utilizadas',
        'hora_inicio',
        'hora_fin',
        'tiempo_total',
        'fecha_cierre'
    ];

    // <-- 2. NUEVA RELACIÓN CON MÁQUINAS
    public function maquina()
    {
        return $this->belongsTo(Maquina::class);
    }

    /* Podemos mantener esta relación por si tienes avisos viejos
    con marca, pero ya no es necesaria para los nuevos.
    */
    public function marca()
    {
        return $this->belongsTo(Marca::class);
    }

    public function tecnico()
    {
        return $this->belongsTo(Tecnico::class, 'tecnico_id');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    protected $casts = [
        'piezas_utilizadas' => 'array',
        'fecha_entrada' => 'date:Y-m-d',
        'fecha_cierre' => 'date:Y-m-d',
    ];
}
