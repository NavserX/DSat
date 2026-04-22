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
        // 1. Validamos los datos
        $request->validate([
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
        ]);

        // 2. Creamos el cliente
        $cliente = Cliente::create($request->all());

        // 3. Lo devolvemos al frontend con código 201 (Creado)
        return response()->json($cliente, 201);
    }
}
