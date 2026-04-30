<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Maquina;
use Illuminate\Http\Request;

// <-- ¡MUY IMPORTANTE! Le decimos a Laravel que vamos a usar la base de datos de Máquinas

class MaquinaController extends Controller
{
    /**
     * Display a listing of the resource.
     * (Devuelve todas las máquinas de la base de datos para rellenar tu tabla)
     */
    public function index()
    {
        return Maquina::all();
    }

    /**
     * Store a newly created resource in storage.
     * (Recibe los datos del formulario "Añadir Máquina" y los guarda)
     */
    public function store(Request $request)
    {
        // Validamos que el número de serie sea obligatorio y ÚNICO en la tabla maquinas
        $request->validate([
            'modelo' => 'required|string',
            'numero_serie' => 'required|string|unique:maquinas,numero_serie',
            'cliente_id' => 'nullable|exists:clientes,id',
        ], [
            'numero_serie.unique' => 'Esta máquina ya está registrada en el sistema.'
        ]);

        $maquina = Maquina::create($request->all());
        return response()->json($maquina, 201);
    }

    /**
     * Display the specified resource.
     * (Devuelve una sola máquina si la buscamos por su ID)
     */
    public function show(string $id)
    {
        return Maquina::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     * (Recibe los datos editados y actualiza la máquina existente)
     */
    public function update(Request $request, string $id)
    {
        // 1. Buscamos la máquina por su ID
        $maquina = Maquina::findOrFail($id);

        // 2. Actualizamos los datos (por ejemplo, si le has cambiado el cliente)
        $maquina->update($request->all());

        return $maquina;
    }

    /**
     * Remove the specified resource from storage.
     * (Borra la máquina cuando le das al botón de la papelera 🗑️)
     */
    public function destroy(string $id)
    {
        Maquina::destroy($id);

        return response()->json(['message' => 'Máquina eliminada correctamente']);
    }
}
