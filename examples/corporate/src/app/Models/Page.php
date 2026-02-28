<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'slug',
        'title',
        'meta_description',
        'sort_order',
        'page_data',
    ];

    protected function casts(): array
    {
        return [
            'page_data' => 'array',
            'sort_order' => 'integer',
        ];
    }
}
