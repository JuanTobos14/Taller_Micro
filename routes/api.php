<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SprintController;
use App\Http\Controllers\HistoriaController;

Route::get('sprints/historias', [SprintController::class, 'historiasPorSprint']);

Route::get('historias/reporte', [HistoriaController::class, 'generateReport']);

Route::apiResource('sprints', SprintController::class);

Route::apiResource('historias', HistoriaController::class);