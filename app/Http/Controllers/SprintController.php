<?php

namespace App\Http\Controllers;

use App\Models\Sprint;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sprints = Sprint::all();
        return response()->json(['data' => $sprints], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
        ]);

        $sprint = Sprint::create($request->all());
        return response()->json(['data' => $sprint, 'message' => 'Sprint creado exitosamente'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $sprint = Sprint::find($id);
        if (empty($sprint)) {
            return response()->json(['data' => 'Sprint no encontrado'], 404);
        }
        return response()->json(['data' => $sprint], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $sprint = Sprint::find($id);
        if (empty($sprint)) {
            return response()->json(['data' => 'Sprint no encontrado'], 404);
        }

        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after_or_equal:fecha_inicio',
        ]);

        $sprint->update($request->all());
        return response()->json(['data' => $sprint, 'message' => 'Sprint actualizado exitosamente'], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $sprint = Sprint::find($id);
        if (empty($sprint)) {
            return response()->json(['data' => 'Sprint no encontrado'], 404);
        }
        $sprint->delete();
        return response()->json(['data' => 'Sprint eliminado exitosamente'], 200);
    }

    /**
     * Display all stories grouped by sprint.
     */
    public function historiasPorSprint()
    {
        $sprints = Sprint::with('historias')->get();
        return response()->json(['data' => $sprints], 200);
    }
}