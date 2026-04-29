<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reparacion;
use App\Models\Pieza; // <-- Importante para gestionar el stock
use Illuminate\Http\Request;

class ReparacionController extends Controller
{
    public function index()
    {
        // Cargamos las reparaciones junto con los datos del cliente, técnico y máquina
        return Reparacion::with(['cliente', 'tecnico', 'maquina'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'tecnico_id' => 'nullable|exists:tecnicos,id',
            'maquina_id' => 'nullable|exists:maquinas,id',
            'descripcion' => 'nullable|string',
            'estado' => 'required|string',
            'fecha_entrada' => 'nullable|date',
        ]);

        $reparacion = Reparacion::create($validated);

        return response()->json($reparacion, 201);
    }

    public function update(Request $request, $id)
    {
        $reparacion = Reparacion::findOrFail($id);

        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'tecnico_id' => 'nullable|exists:tecnicos,id',
            'maquina_id' => 'nullable|exists:maquinas,id',
            'descripcion' => 'nullable|string',
            'estado' => 'required|string',
            'fecha_entrada' => 'nullable|date',

            // Campos de cierre
            'resolucion_texto' => 'nullable|string',
            'hora_inicio' => 'nullable',
            'hora_fin' => 'nullable',
            'fecha_cierre' => 'nullable|date',
            'tiempo_total' => 'nullable|string',
            'piezas_utilizadas' => 'nullable|string',
        ]);

        // =========================================================
        // 🚀 LÓGICA DE STOCK SINCRONIZADA (Técnicos y Admin)
        // =========================================================

        // Verificamos: 1. Estado viene como terminado. 2. Hay piezas.
        // 3. El aviso NO tenía resolución guardada (es el momento del cierre).
        if ($request->estado === 'terminado' && !empty($request->piezas_utilizadas)) {

            if (empty($reparacion->resolucion_texto)) {

                $piezasUsadas = json_decode($request->piezas_utilizadas, true);

                if (is_array($piezasUsadas)) {
                    foreach ($piezasUsadas as $p) {
                        if (!empty($p['referencia'])) {
                            $piezaInventario = Pieza::where('referencia', $p['referencia'])->first();

                            if ($piezaInventario) {
                                // Restamos la cantidad del stock actual
                                $piezaInventario->stock -= (int) $p['cantidad'];
                                $piezaInventario->save();
                            }
                        }
                    }
                }
            }
        }
        // =========================================================

        // 2. ACTUALIZAR
        $reparacion->update($validated);

        return response()->json($reparacion, 200);
    }

    public function destroy($id)
    {
        Reparacion::destroy($id);
        return response()->json(['message' => 'Reparación eliminada'], 200);
    }
}
