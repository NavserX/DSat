<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reparacion;
use App\Models\Pieza;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AvisoAsignadoMail;
use App\Models\User;

class ReparacionController extends Controller
{
    public function index()
    {
        // Con esta función respondo cuando mi frontend me pide la lista de los avisos.
        // Como no quiero saturar la memoria del navegador enviando miles de avisos históricos cerrados,
        // voy a dividir la consulta en dos partes.

        // 1. Me traigo TODOS los avisos que estén "vivos" (pendientes o en proceso) sin límite.
        $activos = Reparacion::with(['cliente', 'tecnico', 'maquina'])
            ->where('estado', '!=', 'terminado')
            ->orderBy('created_at', 'desc')
            ->get();

        // 2. Me traigo SOLO los últimos avisos que ya estén "terminados".
        // Ordeno por 'updated_at' de más reciente a más antiguo para coger justo los últimos que se cerraron.
        $terminados = Reparacion::with(['cliente', 'tecnico', 'maquina'])
            ->where('estado', 'terminado')
            ->orderBy('updated_at', 'desc')
            ->take(20) // Aquí defino el número de avisos máximo que quiero en la pestaña de terminados
            ->get();

        // 3. Fusiono las dos listas en una sola (merge) y se la devuelvo al Frontend de golpe.
        return $activos->merge($terminados);
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

        // =========================================================
        // --- NUEVO: ENVÍO DE CORREO AL CREAR ---
        // =========================================================
        // Si la oficina acaba de crear el aviso y ya le ha asignado un técnico de primeras, le disparo el correo.
        if ($reparacion->tecnico_id) {
            $tecnico = User::find($reparacion->tecnico_id);
            if ($tecnico && $tecnico->email) {
                Mail::to($tecnico->email)->send(new AvisoAsignadoMail($reparacion));
            }
        }
        // =========================================================

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

        // --- TRUCO PARA EL CORREO: Guardo quién era el técnico ANTES de actualizar ---
        $tecnicoAnterior = $reparacion->tecnico_id;

        // Finalmente, una vez procesado el tema del inventario, aplasto los datos viejos de la reparación con los datos nuevos que han pasado la validación.
        $reparacion->update($validated);

        // =========================================================
        // --- NUEVO: ENVÍO DE CORREO AL ACTUALIZAR/ASIGNAR ---
        // =========================================================
        // Solo envío el correo si el aviso ahora tiene técnico Y ese técnico es DIFERENTE al que había antes.
        // Así no hago Spam al técnico cada vez que él mismo guarda o cierra su propia reparación.
        if ($reparacion->tecnico_id && $reparacion->tecnico_id !== $tecnicoAnterior) {
            $tecnico = User::find($reparacion->tecnico_id);
            if ($tecnico && $tecnico->email) {
                Mail::to($tecnico->email)->send(new AvisoAsignadoMail($reparacion));
            }
        }
        // =========================================================

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
