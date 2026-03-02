<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CssSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('css')->updateOrInsert(
            ['category' => 'common'],
            ['content' => '']
        );
        DB::table('css')->updateOrInsert(
            ['category' => 'individual'],
            ['content' => '']
        );
        DB::table('css')->updateOrInsert(
            ['category' => 'special'],
            ['content' => '']
        );
    }
}
