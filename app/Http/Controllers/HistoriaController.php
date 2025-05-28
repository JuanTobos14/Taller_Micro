<?php

namespace App\Http\Controllers;

use App\Models\Historia;
use App\Models\Sprint;
use Illuminate\Http\Request;

class HistoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $historias = Historia::all();
        return response()->json(['data' => $historias], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:150',
            'descripcion' => 'required|string',
            'responsable' => 'required|string|max:100',
            'estado' => 'required|in:nueva,activa,finalizada,impedimento',
            'puntos' => 'required|integer|min:1',
            'fecha_creacion' => 'required|date',
            'sprint_id' => 'required|exists:sprints,id',
        ]);

        $historia = Historia::create($request->all());
        return response()->json(['data' => $historia, 'message' => 'Historia creada exitosamente'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $historia = Historia::find($id);
        if (empty($historia)) {
            return response()->json(['data' => 'Historia no encontrada'], 404);
        }
        return response()->json(['data' => $historia], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $historia = Historia::find($id);
        if (empty($historia)) {
            return response()->json(['data' => 'Historia no encontrada'], 404);
        }

        $request->validate([
            'titulo' => 'sometimes|string|max:150',
            'descripcion' => 'sometimes|string',
            'responsable' => 'sometimes|string|max:100',
            'estado' => 'sometimes|in:nueva,activa,finalizada,impedimento',
            'puntos' => 'sometimes|integer|min:1',
            'fecha_creacion' => 'sometimes|date',
            'fecha_finalizacion' => 'nullable|date|after_or_equal:fecha_creacion',
            'sprint_id' => 'sometimes|exists:sprints,id',
        ]);

        $historia->update($request->all());
        return response()->json(['data' => $historia, 'message' => 'Historia actualizada exitosamente'], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $historia = Historia::find($id);
        if (empty($historia)) {
            return response()->json(['data' => 'Historia no encontrada'], 404);
        }
        $historia->delete();
        return response()->json(['data' => 'Historia eliminada exitosamente'], 200);
    }

    /**
     * Generate a report of stories.
     */
    public function generateReport(Request $request)
    {
        $responsable = $request->query('responsable');

        $query = Historia::query();

        if ($responsable) {
            $query->where('responsable', $responsable);
        }

        $totalHistorias = $query->count();
        $finalizadas = $query->where('estado', 'finalizada')->count();
        $pendientes = $query->where('estado', 'nueva')->orWhere('estado', 'activa')->count();
        $impedimentos = $query->where('estado', 'impedimento')->count();

        return response()->json([
            'total_historias' => $totalHistorias,
            'finalizadas' => $finalizadas,
            'pendientes' => $pendientes,
            'impedimentos' => $impedimentos,
            'responsable' => $responsable ?? 'General',
        ], 200);
    }
}