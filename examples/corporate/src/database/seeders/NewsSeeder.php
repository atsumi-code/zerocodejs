<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        DB::table('news')->insert([
            [
                'slug' => 'sample-news',
                'title' => 'サンプルお知らせ',
                'published_at' => $now->format('Y-m-d'),
                'excerpt' => 'シードで投入したサンプル記事です。編集・公開の動作確認にご利用ください。',
                'page_data' => json_encode([]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
