<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // 1. Listo todos los usuarios
    public function listarUsuarios(Request $request) {
        // Barrera de seguridad: solo el admin puede ver la lista de personal
        if ($request->user()->rol !== 'admin') {
            return response()->json(['error' => 'Acceso denegado'], 403);
        }

        // Devuelvo los usuarios y, si son clientes, traigo también los datos de su empresa
        return User::with('cliente')->orderBy('rol')->get();
    }

    // 2. Creo un nuevo usuario (POST)
    public function crearUsuario(Request $request) {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['error' => 'Acceso denegado. Permisos de administración requeridos.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'rol' => 'required|in:admin,tecnico,cliente',
            'cliente_id' => 'required_if:rol,cliente|exists:clientes,id|nullable'
        ]);

        $usuario = new User();
        $usuario->name = $request->name;
        $usuario->email = $request->email;
        $usuario->password = Hash::make($request->password); // Encripto la contraseña
        $usuario->rol = $request->rol;
        $usuario->cliente_id = $request->rol === 'cliente' ? $request->cliente_id : null;
        $usuario->save();

        return response()->json(['message' => 'Usuario registrado con éxito', 'user' => $usuario], 201);
    }

    // 3. Edito un usuario existente (PUT)
    public function editarUsuario(Request $request, $id) {
        if ($request->user()->rol !== 'admin') return response()->json(['error' => 'Acceso denegado'], 403);

        $usuario = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            // Le decimos a Laravel que el email debe ser único, EXCEPTO para el ID que estamos editando
            'email' => 'required|email|unique:users,email,'.$id,
            'rol' => 'required|in:admin,tecnico,cliente',
            'cliente_id' => 'required_if:rol,cliente|nullable'
        ]);

        $usuario->name = $request->name;
        $usuario->email = $request->email;
        $usuario->rol = $request->rol;
        $usuario->cliente_id = $request->rol === 'cliente' ? $request->cliente_id : null;

        // Si el admin ha escrito algo en el campo de contraseña, la actualizo. Si lo dejo en blanco, se queda la vieja.
        if ($request->filled('password')) {
            $usuario->password = Hash::make($request->password);
        }

        $usuario->save();
        return response()->json(['message' => 'Usuario actualizado']);
    }

    // 4. Borro un usuario (DELETE)
    public function borrarUsuario(Request $request, $id) {
        if ($request->user()->rol !== 'admin') return response()->json(['error' => 'Acceso denegado'], 403);

        User::destroy($id);
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
