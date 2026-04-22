<?php

use App\Models\User;
use App\Models\Cliente;
use App\Models\Tecnico;
use App\Models\Marca;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReparacionController;

Route::post('/login', function (Request $request) {
    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Credenciales incorrectas'], 401);
    }

    $user = User::where('email', $request->email)->firstOrFail();
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Hola ' . $user->name,
        'access_token' => $token,
        'token_type' => 'Bearer',
    ]);
});

// ZONA PROTEGIDA: Solo usuarios con Token (Logueados)
Route::middleware('auth:sanctum')->group(function () {

    // --- REPARACIONES ---
    // Esta única línea ya genera automáticamente el GET, POST, PUT y DELETE protegidos.
    Route::apiResource('reparaciones', ReparacionController::class);

    // --- CLIENTES ---
    // Obtener todos los clientes (GET)
    Route::get('/clientes', function () {
        return Cliente::all();
    });

    // ¡AQUÍ ESTÁ LA SOLUCIÓN AL 405! Crear un cliente (POST)
    Route::post('/clientes', function (Request $request) {
        // Validamos que los datos que llegan son correctos
        $request->validate([
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
        ]);

        // Guardamos en la base de datos
        $cliente = Cliente::create([
            'nombre' => $request->nombre,
            'telefono' => $request->telefono,
            'direccion' => $request->direccion,
        ]);

        // Devolvemos el cliente recién creado para que el panel lo seleccione
        return response()->json($cliente, 201);
    });

    // --- TÉCNICOS Y MARCAS ---
    Route::get('/tecnicos', function () {
        return Tecnico::all();
    });

    Route::get('/marcas', function () {
        return Marca::all();
    });

});
