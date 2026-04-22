<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reparacion extends Model
{
    protected $table = 'reparaciones';
    protected $fillable = ['marca_id', 'tecnico_id', 'cliente_id', 'descripcion', 'estado', 'fecha_entrada'];

    public function marca() { return $this->belongsTo(Marca::class); }
    public function tecnico() { return $this->belongsTo(Tecnico::class); }
    public function cliente() { return $this->belongsTo(Cliente::class); }
}
