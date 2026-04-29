<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Pieza extends Model {
    protected $fillable = ['referencia', 'descripcion', 'stock', 'precio'];
}
