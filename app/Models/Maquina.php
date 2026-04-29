<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Maquina extends Model {
    protected $fillable = ['modelo', 'numero_serie', 'cliente_id'];

    public function cliente() {
        return $this->belongsTo(Cliente::class);
    }
}
