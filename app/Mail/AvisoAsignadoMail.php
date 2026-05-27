<?php

namespace App\Mail;

use App\Models\Reparacion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AvisoAsignadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reparacion;

    public function __construct(Reparacion $reparacion)
    {
        $this->reparacion = $reparacion;
    }

    public function build()
    {
        return $this->subject('🔔 Nuevo aviso asignado: #' . $this->reparacion->id)
            ->view('emails.aviso_asignado');
    }
}
