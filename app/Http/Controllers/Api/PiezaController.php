<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Pieza;
use Illuminate\Http\Request;

class PiezaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Pieza::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate(['referencia' => 'required', 'descripcion' => 'required']);
        return Pieza::create($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $pieza = Pieza::findOrFail($id);
        $pieza->update($request->all());
        return $pieza;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Pieza::destroy($id);
        return response()->json(['message' => 'Eliminada']);
    }
}
