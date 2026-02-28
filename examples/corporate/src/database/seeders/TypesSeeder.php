<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('types')->insert([
            [
                'id' => 'corp-type-cta',
                'category' => 'common',
                'type' => 'cta',
                'description' => 'CTA（お問い合わせ誘導）',
                'sort_order' => 0,
            ],
        ]);
    }
}
