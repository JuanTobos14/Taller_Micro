<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sprint extends Model
{
    use HasFactory;

    protected $table = 'sprints';

    protected $fillable = [
        'nombre',
        'fecha_inicio',
        'fecha_fin',
    ];

    public function historias()
    {
        return $this->hasMany(Historia::class);
    }
}