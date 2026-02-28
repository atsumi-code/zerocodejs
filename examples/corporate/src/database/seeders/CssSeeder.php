<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CssSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('css')->insert([
            ['category' => 'common', 'content' => ''],
            ['category' => 'individual', 'content' => ''],
            ['category' => 'special', 'content' => ''],
        ]);
    }
}
