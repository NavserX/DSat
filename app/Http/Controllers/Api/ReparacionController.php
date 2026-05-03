<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reparacion;
use App\Models\Pieza;
use Illuminate\Http\Request;

class ReparacionController extends Controller
{
    public function index()
    {
        // Con esta función respondo cuando mi frontend me pide la lista de todos los avisos.
        // Uso el método "with" para pedirle a Laravel que, de paso que me trae la reparación, haga un cruce con las tablas de cliente, técnico y máquina.
        // Así me traigo toda la información de golpe y evito que la base de datos se sature haciendo cientos de consultas individuales luego.
        return Reparacion::with(['cliente', 'tecnico', 'maquina'])->get();
    }

    public function store(Request $request)
    {
        // Aquí aterriza la petición cuando creo un aviso totalmente nuevo.
        // Primero paso los datos por este filtro de seguridad. Le digo a Laravel qué campos son obligatorios y cuáles pueden ir vacíos, y sobre todo, compruebo que el ID del cliente o de la máquina que me envían existan de verdad en la base de datos.
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'tecnico_id' => 'nullable|exists:tecnicos,id',
            'maquina_id' => 'nullable|exists:maquinas,id',
            'descripcion' => 'nullable|string',
            'estado' => 'required|string',
            'fecha_entrada' => 'nullable|date',
        ]);

        // Si los datos superan el filtro sin dar error, le ordeno al modelo que cree el registro en la base de datos.
        $reparacion = Reparacion::create($validated);

        // Devuelvo el aviso recién creado con un código 201, que en el estándar web significa "Creado con éxito".
        return response()->json($reparacion, 201);
    }

    public function update(Request $request, $id)
    {
        // Esta función me sirve para dos cosas: editar un aviso normal y corriente, o procesar el cierre del aviso cuando el técnico termina.
        // Lo primero es buscar la reparación en la base de datos. Si el ID no existe, Laravel cortará la ejecución aquí mismo y devolverá un error 404 automáticamente.
        $reparacion = Reparacion::findOrFail($id);

        // Vuelvo a pasar el filtro de validación, pero esta vez incluyo todos los campos extra que me llegan desde el modal de finalización (horas, tiempos, resolución y las piezas usadas).
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
            'firma_cliente' => 'nullable|string',
        ]);

        // =========================================================
        // LOGICA DE STOCK SINCRONIZADA
        // =========================================================

        // Aquí hago la gestión automática del inventario.
        // Primero compruebo dos cosas: que me estén mandando el estado como "terminado" y que de verdad hayan gastado piezas.
        if ($request->estado === 'terminado' && !empty($request->piezas_utilizadas)) {

            // Esta comprobación es vital. Miro en la base de datos si este aviso ya tenía un texto de resolución guardado de antes.
            // Si está vacío, significa que el aviso se está cerrando JUSTO AHORA. Si ya tuviera texto, significa que alguien está editando un aviso que ya estaba cerrado, y no quiero volver a restar piezas que ya resté en su día.
            if (empty($reparacion->resolucion_texto)) {

                // Las piezas me llegan desde javascript como un texto plano. Las descodifico para convertirlas en un array de PHP y poder recorrerlas.
                $piezasUsadas = json_decode($request->piezas_utilizadas, true);

                if (is_array($piezasUsadas)) {
                    // Recorro la cesta de la compra del técnico pieza por pieza.
                    foreach ($piezasUsadas as $p) {
                        if (!empty($p['referencia'])) {

                            // Por cada pieza usada, busco su equivalente exacto en mi tabla general de inventario usando su referencia única.
                            $piezaInventario = Pieza::where('referencia', $p['referencia'])->first();

                            if ($piezaInventario) {
                                // Si encuentro la pieza en el almacén, le resto la cantidad exacta que me ha dicho el técnico que ha usado y guardo el cambio en la base de datos de inventario.
                                $piezaInventario->stock -= (int) $p['cantidad'];
                                $piezaInventario->save();
                            }
                        }
                    }
                }
            }
        }
        // =========================================================

        // Finalmente, una vez procesado el tema del inventario, aplasto los datos viejos de la reparación con los datos nuevos que han pasado la validación.
        $reparacion->update($validated);

        // Respondo al frontend con un código 200 (OK) y los datos actualizados para que los pinte en la tabla.
        return response()->json($reparacion, 200);
    }

    public function destroy($id)
    {
        // Ordeno la destrucción total del registro basándome en el ID que me mandan por la URL.
        Reparacion::destroy($id);

        // Devuelvo un mensaje de confirmación simple.
        return response()->json(['message' => 'Reparación eliminada'], 200);
    }
}
