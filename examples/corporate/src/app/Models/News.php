<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'published_at',
        'excerpt',
        'page_data',
    ];

    protected function casts(): array
    {
        return [
            'page_data' => 'array',
            'published_at' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
