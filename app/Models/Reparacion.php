<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reparacion extends Model
{
    protected $table = 'reparaciones';

    protected $fillable = [
        'marca_id',
        'tecnico_id',
        'cliente_id',
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
