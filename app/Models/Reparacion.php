<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reparacion extends Model
{
    protected $table = 'reparaciones';

    // Hemos añadido: hora_inicio, hora_fin, tiempo_total y fecha_cierre
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

    /**
     * Relación con la Marca
     */
    public function marca()
    {
        return $this->belongsTo(Marca::class);
    }

    /**
     * Relación con el Técnico (Modelo User o Tecnico según tu estructura)
     * Si usas la tabla 'users' para los técnicos, cámbialo a User::class
     */
    public function tecnico()
    {
        return $this->belongsTo(Tecnico::class, 'tecnico_id');
    }

    /**
     * Relación con el Cliente
     */
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    /**
     * Accesorio opcional: Si quieres que piezas_utilizadas se comporte
     * como un array automáticamente en lugar de un string JSON.
     */
    protected $casts = [
        'piezas_utilizadas' => 'array',
        'fecha_entrada' => 'date:Y-m-d',
        'fecha_cierre' => 'date:Y-m-d',
    ];
}
