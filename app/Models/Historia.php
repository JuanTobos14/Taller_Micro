<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Historia extends Model
{
    use HasFactory;

    protected $table = 'historias';

    protected $fillable = [
        'titulo',
        'descripcion',
        'responsable',
        'estado',
        'puntos',
        'fecha_creacion',
        'fecha_finalizacion',
        'sprint_id',
    ];

    protected $casts = [
        'fecha_creacion' => 'date',
        'fecha_finalizacion' => 'date',
    ];

    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
    }
}