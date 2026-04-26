<?php

use App\Models\User;
use App\Models\Cliente;
use App\Models\Tecnico;
use App\Models\Marca;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReparacionController;

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
    // Si las credenciales no coinciden en la base de datos, corto en seco y devuelvo error 401.
    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Credenciales incorrectas'], 401);
    }

    // Si todo va bien, busco al usuario y le genero un Token criptográfico.
    $user = User::where('email', $request->email)->firstOrFail();
    $token = $user->createToken('auth_token')->plainTextToken;

    // Se lo envío al Frontend para que lo guarde en su localStorage.
    return response()->json([
        'message' => 'Hola ' . $user->name,
        'access_token' => $token,
        'token_type' => 'Bearer',
    ]);
});

/**
 * --- ZONA BLINDADA (MIDDLEWARE) ---
 * A partir de esta línea, cualquier ruta requiere obligatoriamente que el Frontend
 * me envíe el Token válido en la cabecera (Authorization: Bearer...).
 * Si no hay token, el sistema expulsa al usuario automáticamente.
 */
Route::middleware('auth:sanctum')->group(function () {

    // --- PERFIL DE USUARIO ---
    // Este endpoint es vital para la seguridad visual. El Frontend lo llama al iniciar
    // para saber si tiene que cargar la vista de 'admin' o el modo enfoque de 'tecnico'.
    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    // --- MÓDULO DE REPARACIONES ---
    // En lugar de meter aquí 200 líneas de código, delego todo el CRUD
    // (Crear, Leer, Actualizar, Borrar) a su propio Controlador especializado.
    Route::apiResource('reparaciones', ReparacionController::class);


    // --- MÓDULO DE CLIENTES ---
    // Obtener la lista completa de clientes para el autocompletado y buscadores
    Route::get('/clientes', function () {
        return Cliente::all();
    });

    // Guardar un cliente nuevo (Fast-Track desde el Modal flotante)
    Route::post('/clientes', function (Request $request) {

        // 1. VALIDACIÓN (El escudo del servidor)
        // Me aseguro de que el Frontend me manda exactamente lo que espero.
        // Ojo: El 'email' es clave que esté en esta lista blanca para evitar el error de asignación masiva.
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255', // El campo puede venir nulo o con un correo falso dinámico
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
        ]);

        // 2. INSERCIÓN
        // Como la validación ha pasado, guardo los datos limpios en la base de datos.
        $cliente = Cliente::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'direccion' => $request->direccion,
        ]);

        // 3. RESPUESTA
        // Devuelvo el cliente recién creado (con su nuevo ID) y un código HTTP 201 (Created)
        return response()->json($cliente, 201);
    });


    // --- MÓDULOS SECUNDARIOS (Selectores) ---
    // Estas rutas simplemente escupen los datos en bruto para rellenar
    // los desplegables de "Técnicos" y "Marcas" en el formulario de reparaciones.

    Route::get('/tecnicos', function () {
        return Tecnico::all();
    });

    Route::get('/marcas', function () {
        return Marca::all();
    });

});
