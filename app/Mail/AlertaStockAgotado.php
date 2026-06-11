<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Pieza;

class AlertaStockAgotado extends Mailable
{
    use Queueable, SerializesModels;

    public $pieza;

    // Cuando enviamos este correo, le paso la pieza que se ha agotado
    public function __construct(Pieza $pieza)
    {
        $this->pieza = $pieza;
    }

    public function build()
    {
        return $this->subject('⚠️ ALERTA: Stock agotado - ' . $this->pieza->referencia)
            ->view('emails.stock_agotado');
    }
}
