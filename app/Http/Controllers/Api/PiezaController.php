<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Pieza;
use Illuminate\Http\Request;

class PiezaController extends Controller
{
    public function index()
    {
        // Con esta función le pido a la base de datos que me traiga el catálogo completo de piezas y repuestos.
        // Lo utilizo tanto para cargar la tabla principal de la sección de Inventario como para alimentar el buscador interno del modal cuando voy a cerrar un aviso.
        return Pieza::all();
    }

    public function store(Request $request)
    {
        // Aquí llega la información cuando registro una pieza nueva por primera vez.
        // Antes de guardar nada, le pongo un filtro de validación obligatorio: no permito que se cree un repuesto si no me han escrito su referencia técnica y una descripción. Esto evita que mi base de datos se llene de registros en blanco o inservibles.
        $request->validate([
            'referencia' => 'required',
            'descripcion' => 'required'
        ]);

        // Si pasa el filtro, ordeno que se cree el registro con todos los datos y lo devuelvo.
        return Pieza::create($request->all());
    }

    public function show(string $id)
    {
        // Dejo esta función en blanco intencionadamente.
        // Como estoy trabajando con una aplicación de una sola página (SPA) y ya me descargo todas las piezas de golpe en el index, de momento no necesito una ruta para consultar los datos de una sola pieza aislada.
    }

    public function update(Request $request, string $id)
    {
        // Esta función se dispara cuando modifico una pieza que ya existe (por ejemplo, si corrijo su precio o hago un ajuste manual de stock).
        // Primero busco la pieza exacta en la base de datos usando el ID que me llega. Si no existe, Laravel cortará el proceso automáticamente.
        $pieza = Pieza::findOrFail($id);

        // Una vez la tengo localizada, machaco sus datos antiguos con la información nueva que me llega en la petición.
        $pieza->update($request->all());

        // Devuelvo el objeto actualizado al frontend para confirmar que el cambio se hizo bien.
        return $pieza;
    }

    public function destroy(string $id)
    {
        // Si decido borrar un repuesto del catálogo definitivamente, la orden llega aquí con su ID numérico.
        // Le ordeno al modelo que lo destruya de la base de datos.
        Pieza::destroy($id);

        // Devuelvo un mensaje en formato JSON confirmando la eliminación para que mi javascript pueda actualizar la tabla visualmente.
        return response()->json(['message' => 'Eliminada']);
    }
}
