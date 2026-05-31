<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cliente;
use App\Models\Reparacion;
use Illuminate\Support\Facades\Mail;

class PortalClienteController extends Controller
{
    // 1. Función para que el cliente "inicie sesión" usando su email y teléfono
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'telefono' => 'required'
        ]);

        $cliente = Cliente::with('maquinas')
            ->where('email', $request->email)
            ->where('telefono', $request->telefono)
            ->first();

        if (!$cliente) {
            return response()->json(['message' => 'Credenciales incorrectas o cliente no encontrado.'], 404);
        }

        // Traigo los últimos 5 avisos de este cliente ---
        // Uso 'with' para traer el nombre de la máquina y orderBy para coger los más nuevos
        $ultimos_avisos = Reparacion::with(['maquina', 'tecnico'])
            ->where('cliente_id', $cliente->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Le pego ese historial al cliente para enviarlo al Javascript
        $cliente->ultimos_avisos = $ultimos_avisos;

        return response()->json($cliente, 200);
    }

    // 2. Función para guardar el aviso que el cliente ha escrito
    public function guardarAviso(Request $request)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'maquina_id' => 'nullable|exists:maquinas,id',
            'descripcion' => 'required|string'
        ]);

        // Creo el aviso exactamente igual que si lo hiciera un admin,
        // forzando el estado a 'pendiente' y apuntando la fecha de hoy.
        $reparacion = Reparacion::create([
            'cliente_id' => $request->cliente_id,
            'maquina_id' => $request->maquina_id,
            'descripcion' => $request->descripcion,
            'estado' => 'pendiente',
            'fecha_entrada' => now()->toDateString(),
        ]);

        // =========================================================
        // ENVÍO DE CORREO HTML DE ALERTA AL TALLER ---
        // =========================================================
        try {
            // Busco el nombre del cliente para ponerlo en el correo
            $cliente = Cliente::find($request->cliente_id);
            $nombreCliente = $cliente ? $cliente->nombre : 'Un cliente';

            // Uso Mail::send() en lugar de Mail::raw() para cargar la nueva vista HTML.
            // Le paso las variables $reparacion y $nombreCliente para que pueda imprimirlas.
            Mail::send('emails.nuevo_aviso_cliente', [
                'reparacion' => $reparacion,
                'nombreCliente' => $nombreCliente
            ], function ($message) {
                $message->to('taller@ofimaticadigital.es')
                    ->subject('🔴 Nuevo aviso creado en el portal de cliente!');
            });
        } catch (\Exception $e) {
            // Si el correo falla, lo ignoro para no asustar al cliente.
        }
        // =========================================================

        return response()->json($reparacion, 201);
    }
}
