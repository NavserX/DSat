<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reparacion;
use Illuminate\Http\Request;

class ReparacionController extends Controller
{
    /**
     * GET: Listo todas las reparaciones con sus relaciones.
     */
    public function index()
    {
        $user = auth()->user();

        // Si es técnico, ve los suyos Y los que están Libres (tecnico_id = null)
        if ($user->rol === 'tecnico') {
            return Reparacion::with(['marca', 'tecnico', 'cliente'])
                ->where('tecnico_id', $user->id)
                ->orWhereNull('tecnico_id') // <-- ESTO PERMITE VER LOS AVISOS LIBRES
                ->get();
        }

        // Si es admin, lo ve todo
        return Reparacion::with(['marca', 'tecnico', 'cliente'])->get();
    }

    /**
     * POST: Creo una nueva reparación.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        // Un técnico solo puede asignarse un aviso a sí mismo o dejarlo libre
        if ($user->rol === 'tecnico' && $request->tecnico_id != null && $request->tecnico_id != $user->id) {
            return response()->json(['error' => 'No tienes permiso para asignar avisos a otros técnicos.'], 403);
        }

        $request->validate([
            'marca_id'    => 'required|exists:marcas,id',
            // OJO: Asumo que la tabla de técnicos es la de 'users'. Si tienes una tabla 'tecnicos', cámbialo a exists:tecnicos,id
            'tecnico_id'  => 'nullable|exists:users,id',
            'cliente_id'  => 'required|exists:clientes,id',
            'descripcion' => 'nullable|string', // Permito que la descripción inicial venga vacía a veces
            'fecha_entrada' => 'nullable|date',
            'estado'      => 'nullable|string'
        ]);

        $reparacion = Reparacion::create($request->all());

        return response()->json([
            'mensaje' => 'Reparación registrada con éxito',
            'datos'   => $reparacion->load(['marca', 'tecnico', 'cliente'])
        ], 201);
    }

    /**
     * GET {id}: Obtengo una reparación específica.
     */
    public function show($id)
    {
        $user = auth()->user();
        $reparacion = Reparacion::with(['marca', 'tecnico', 'cliente'])->findOrFail($id);

        // Bloqueo si es técnico, el aviso tiene dueño, y el dueño NO es él
        if ($user->rol === 'tecnico' && $reparacion->tecnico_id !== null && $reparacion->tecnico_id !== $user->id) {
            return response()->json(['error' => 'No tienes permiso para ver este aviso.'], 403);
        }

        return $reparacion;
    }

    /**
     * PUT {id}: Actualizo una reparación.
     */
    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $reparacion = Reparacion::findOrFail($id);

        // SEGURIDAD CLAVE: Un técnico solo puede modificar un aviso si ES SUYO, o si ESTÁ LIBRE (para cogerlo)
        if ($user->rol === 'tecnico' && $reparacion->tecnico_id !== null && $reparacion->tecnico_id !== $user->id) {
            return response()->json(['error' => 'No tienes permiso para editar un aviso de otro compañero.'], 403);
        }

        $request->validate([
            'marca_id'    => 'exists:marcas,id',
            'tecnico_id'  => 'nullable|exists:users,id', // Debe permitir nulos
            'cliente_id'  => 'exists:clientes,id',
            'resolucion_texto' => 'nullable|string', // Para el nuevo campo de finalizar
            'piezas_utilizadas' => 'nullable|json'   // Para las piezas
        ]);

        $reparacion->update($request->all());

        return response()->json($reparacion->load(['marca', 'tecnico', 'cliente']));
    }

    /**
     * DELETE {id}: Elimino un registro.
     */
    public function destroy($id)
    {
        $user = auth()->user();

        // Los técnicos NUNCA pueden borrar avisos de la base de datos
        if ($user->rol === 'tecnico') {
            return response()->json(['error' => 'Los técnicos no tienen permisos para eliminar registros.'], 403);
        }

        $reparacion = Reparacion::findOrFail($id);
        $reparacion->delete();

        return response()->json(['mensaje' => 'Reparación eliminada'], 200);
    }
}
