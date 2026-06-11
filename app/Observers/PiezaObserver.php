<?php

namespace App\Observers;

use App\Models\Pieza;
use Illuminate\Support\Facades\Mail;
use App\Mail\AlertaStockAgotado;

class PiezaObserver
{
    /**
     * Escucha el evento cuando una pieza es actualizada.
     */
    public function updated(Pieza $pieza): void
    {
        // Este método isDirty comprueba si el campo 'stock' ha cambiado en esta operación
        // getOriginal dice el valor exacto que tenía antes de guardarse
        if ($pieza->isDirty('stock') && $pieza->stock <= 0 && $pieza->getOriginal('stock') > 0) {

            Mail::to('taller@ofimaticadigital.es')->send(new AlertaStockAgotado($pieza));

        }
    }
}
