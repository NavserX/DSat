<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index()
    {
        // Con esta función le pido a la base de datos que me devuelva el listado completo de clientes.
        // Lo necesito porque mi frontend descarga esta lista entera al arrancar la aplicación para que el buscador predictivo funcione al instante, sin tener que hacer peticiones al servidor por cada letra que tecleo.
        return Cliente::all();
    }

    public function store(Request $request)
    {
        // Aquí llega la información cuando guardo un cliente nuevo, ya sea desde la pantalla de gestión de clientes o desde la ventana flotante rápida de la sección de reparaciones.

        // Primero paso los datos por un filtro de seguridad. Me aseguro de que el nombre venga relleno obligatoriamente para no tener fichas de clientes en blanco o corruptas. El teléfono y la dirección los dejo como opcionales por si el técnico tiene prisa y no se los pide en ese momento.
        $request->validate([
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
        ]);

        // Una vez confirmados los datos y pasado el filtro, le digo a Laravel que inserte el nuevo registro en la tabla de clientes con todo lo que me ha llegado.
        $cliente = Cliente::create($request->all());

        // Devuelvo el cliente que acabo de crear empaquetado en JSON junto con un código 201 de protocolo HTTP (que significa "Creado con éxito").
        // Es súper importante devolver este objeto entero de vuelta, porque mi javascript necesita recibir el ID numérico que la base de datos le acaba de asignar para poder auto-seleccionarlo directamente en el formulario de crear aviso.
        return response()->json($cliente, 201);
    }
}
