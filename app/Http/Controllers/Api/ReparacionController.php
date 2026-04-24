<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reparacion;
use Illuminate\Http\Request;

class ReparacionController extends Controller
{
    /**
     * GET: Listo todas las reparaciones con sus relaciones (FILTRADO POR ROL).
     */
    public function index()
    {
        // Obtenemos al usuario que está haciendo la petición gracias al Token
        $user = auth()->user();

        // Si el usuario tiene rol de técnico, filtramos la consulta
        if ($user->rol === 'tecnico') {
            return Reparacion::with(['marca', 'tecnico', 'cliente'])
                ->where('tecnico_id', $user->tecnico_id)
                ->get();
        }

        // Si es admin (o cualquier otro), devolvemos todo sin el 'where'
        return Reparacion::with(['marca', 'tecnico', 'cliente'])->get();
    }

    /**
     * POST: Creo una nueva reparación.
     */
    public function store(Request $request)
    {
        // Validación de seguridad (opcional pero recomendada):
        // Si quieres que los técnicos NO puedan crear avisos para otros, añade esto:
        $user = auth()->user();
        if ($user->rol === 'tecnico' && $request->tecnico_id != $user->tecnico_id) {
            return response()->json(['error' => 'No tienes permiso para asignar avisos a otros técnicos.'], 403);
        }

        // Validamos que los IDs enviados existan en sus respectivas tablas
        $request->validate([
            'marca_id'    => 'required|exists:marcas,id',
            'tecnico_id'  => 'required|exists:tecnicos,id',
            'cliente_id'  => 'required|exists:clientes,id',
            'descripcion' => 'required|string',
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

        // SEGURIDAD: Comprobamos si es técnico y si el aviso le pertenece
        if ($user->rol === 'tecnico' && $reparacion->tecnico_id !== $user->tecnico_id) {
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

        // SEGURIDAD: Comprobamos si es técnico y si el aviso le pertenece antes de dejarle actualizar
        if ($user->rol === 'tecnico' && $reparacion->tecnico_id !== $user->tecnico_id) {
            return response()->json(['error' => 'No tienes permiso para editar este aviso.'], 403);
        }

        // Validamos también al actualizar para evitar datos corruptos
        $request->validate([
            'marca_id'    => 'exists:marcas,id',
            'tecnico_id'  => 'exists:tecnicos,id',
            'cliente_id'  => 'exists:clientes,id',
        ]);

        $reparacion->update($request->all());

        // Cargamos las relaciones para que el Frontend vea los nombres actualizados
        return response()->json($reparacion->load(['marca', 'tecnico', 'cliente']));
    }

    /**
     * DELETE {id}: Elimino un registro.
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $reparacion = Reparacion::findOrFail($id);

        // SEGURIDAD: Comprobamos si es técnico y si el aviso le pertenece antes de dejarle borrar
        // Incluso podrías quitar esta opción y que SOLO los admin puedan borrar (quitando la segunda condición del if)
        if ($user->rol === 'tecnico' && $reparacion->tecnico_id !== $user->tecnico_id) {
            return response()->json(['error' => 'No tienes permiso para borrar este aviso.'], 403);
        }

        $reparacion->delete();

        // Devolvemos un 204 (No Content) o un mensaje de éxito
        return response()->json(['mensaje' => 'Reparación eliminada'], 200);
    }
}
