<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    /**
     * GET: Devuelve todos los clientes
     */
    public function index()
    {
        return Cliente::all();
    }

    /**
     * POST: Crea un nuevo cliente desde el panel modal
     */
    public function store(Request $request)
    {
        // Valido los datos
        $request->validate([
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
        ]);

        // Creo el cliente
        $cliente = Cliente::create($request->all());

        // Lo devolvuelvo al frontend con código 201 (Creado)
        return response()->json($cliente, 201);
    }
}
