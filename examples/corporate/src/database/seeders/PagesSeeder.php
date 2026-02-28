<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PagesSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        DB::table('pages')->insert([
            [
                'id' => 'default',
                'slug' => '/',
                'title' => 'トップ',
                'meta_description' => null,
                'sort_order' => 0,
                'page_data' => json_encode([]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 'about',
                'slug' => 'about',
                'title' => '会社概要',
                'meta_description' => null,
                'sort_order' => 1,
                'page_data' => json_encode([]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 'services',
                'slug' => 'services',
                'title' => '事業内容',
                'meta_description' => null,
                'sort_order' => 2,
                'page_data' => json_encode([]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
