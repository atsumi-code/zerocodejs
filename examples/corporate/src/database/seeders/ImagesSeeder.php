<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImagesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('images')->insert([
            [
                'id' => 'hero-bg',
                'category' => 'common',
                'name' => 'ヒーロー背景',
                'url' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
                'mime_type' => null,
                'needs_upload' => false,
            ],
            [
                'id' => 'img-service-1',
                'category' => 'common',
                'name' => 'サービス1',
                'url' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80',
                'mime_type' => null,
                'needs_upload' => false,
            ],
            [
                'id' => 'img-service-2',
                'category' => 'common',
                'name' => 'サービス2',
                'url' => 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80',
                'mime_type' => null,
                'needs_upload' => false,
            ],
            [
                'id' => 'img-service-3',
                'category' => 'common',
                'name' => 'サービス3',
                'url' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
                'mime_type' => null,
                'needs_upload' => false,
            ],
        ]);
    }
}
