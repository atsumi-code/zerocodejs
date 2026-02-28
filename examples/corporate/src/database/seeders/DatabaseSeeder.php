<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            CssSeeder::class,
            TypesSeeder::class,
            PartsSeeder::class,
            ImagesSeeder::class,
            PagesSeeder::class,
            NewsSeeder::class,
        ]);
    }
}
