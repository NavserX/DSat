<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';
    protected $fillable = ['nombre', 'email' , 'telefono', 'direccion'];

    public function maquinas()
    {
        return $this->hasMany(Maquina::class, 'cliente_id');
    }

}
