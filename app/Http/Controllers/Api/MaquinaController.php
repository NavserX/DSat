<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Maquina;
use Illuminate\Http\Request;

class MaquinaController extends Controller
{
    public function index()
    {
        // Con esta función respondo a mi frontend cuando arranca la pantalla del parque de máquinas.
        // Le pido a la base de datos que me devuelva absolutamente todos los equipos registrados para poder mostrarlos en la tabla y usarlos en los buscadores.
        return Maquina::all();
    }

    public function store(Request $request)
    {
        // Aquí aterriza la petición cuando relleno el formulario para registrar un equipo totalmente nuevo.
        // Lo primero que hago es pasarle un filtro de seguridad estricto a los datos que me llegan.
        $request->validate([
            'modelo' => 'required|string',

            // Le exijo a Laravel que compruebe que el número de serie no esté en blanco, pero lo más importante: le obligo a buscar en la tabla "maquinas" para asegurarse de que ese número de serie no existe ya. Así evito crear equipos duplicados por error.
            'numero_serie' => 'required|string|unique:maquinas,numero_serie',
            'cliente_id' => 'nullable|exists:clientes,id',
        ], [
            // Si el filtro detecta que el número de serie ya existe, personalizo el mensaje de error para que mi frontend lo pueda leer y mostrar en una alerta comprensible.
            'numero_serie.unique' => 'Esta máquina ya está registrada en el sistema.'
        ]);

        // Si los datos superan el filtro, le ordeno al modelo que cree el registro insertando todos los campos de golpe.
        $maquina = Maquina::create($request->all());

        // Devuelvo los datos de la máquina recién creada con un código 201 (Creado con éxito).
        return response()->json($maquina, 201);
    }

    public function show(string $id)
    {
        // Si en algún momento concreto necesito consultar los datos de una sola máquina aislada usando su ID numérico, uso esta función.
        // Uso findOrFail para que, si busco una máquina que no existe, Laravel devuelva un error 404 automáticamente en lugar de romper el código.
        return Maquina::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        // Cuando pulso el botón de guardar tras haber editado un equipo (por ejemplo, para cambiarle el número de serie o asignárselo a otro cliente), la petición llega aquí mediante el método PUT.

        // Primero busco en la base de datos el equipo exacto usando el ID que me llega por la URL.
        $maquina = Maquina::findOrFail($id);

        // Una vez localizado, aplasto sus datos antiguos con el paquete de datos nuevos que me viene en la petición.
        $maquina->update($request->all());

        // Devuelvo el objeto actualizado para que mi javascript confirme que el cambio se ha aplicado.
        return $maquina;
    }

    public function destroy(string $id)
    {
        // Si decido dar de baja un equipo y lo elimino desde la tabla, el ID llega hasta esta función.
        // Le ordeno a la base de datos que destruya el registro para siempre basándose en ese ID.
        Maquina::destroy($id);

        // Contesto con un mensaje de confirmación simple para que el frontend sepa que puede recargar la tabla visualmente.
        return response()->json(['message' => 'Máquina eliminada correctamente']);
    }
}
