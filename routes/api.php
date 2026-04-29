<?php

use App\Http\Controllers\Api\MaquinaController;
use App\Http\Controllers\Api\PiezaController;
use App\Http\Controllers\Api\ReparacionController;
use App\Models\Cliente;
use App\Models\Tecnico;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// <-- AÑADIDO: Controlador de Piezas

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Aquí es donde registro todas las rutas de mi API.
| El Frontend (JavaScript) se comunicará con estas URLs.
*/

/**
 * --- INICIO DE SESIÓN ---
 * Endpoint público. Recibe email y password.
 */
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

/**
 * --- ZONA BLINDADA (MIDDLEWARE) ---
 */
Route::middleware('auth:sanctum')->group(function () {

    // --- PERFIL DE USUARIO ---
    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    // --- MÓDULO DE REPARACIONES ---
    Route::apiResource('reparaciones', ReparacionController::class);

    // --- MÓDULO DE MÁQUINAS ---
    Route::apiResource('maquinas', MaquinaController::class);

    // --- MÓDULO DE INVENTARIO (PIEZAS) <-- ¡NUEVO! ---
    Route::apiResource('piezas', PiezaController::class);


    // ====================================================================
    // --- MÓDULO DE CLIENTES (CRM) ---
    // ====================================================================

    // 1. LEER TODOS (Para tablas y buscadores)
    Route::get('/clientes', function () {
        return Cliente::all();
    });

    // 2. CREAR CLIENTE
    Route::post('/clientes', function (Request $request) {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
        ]);

        $cliente = Cliente::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'direccion' => $request->direccion,
        ]);

        return response()->json($cliente, 201);
    });

    // 3. ACTUALIZAR CLIENTE (EDITAR)
    Route::put('/clientes/{id}', function (Request $request, $id) {
        $cliente = Cliente::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255',
            // Quitamos la restricción de que sea un email válido para que acepte los "falsos" generados
            'email' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
        ]);

        $cliente->update([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'direccion' => $request->direccion,
        ]);

        return response()->json($cliente, 200);
    });

    // 4. BORRAR CLIENTE
    Route::delete('/clientes/{id}', function ($id) {
        $cliente = Cliente::findOrFail($id);
        $cliente->delete();

        return response()->json(['message' => 'Cliente eliminado correctamente'], 200);
    });


    // --- MÓDULOS SECUNDARIOS (Selectores) ---
    Route::get('/tecnicos', function () {
        return Tecnico::all();
    });

    // Esta ruta ya no la usa el frontend, pero la dejo comentada por si en un futuro la necesitas
    /*
    Route::get('/marcas', function () {
        return Marca::all();
    });
    */

});
