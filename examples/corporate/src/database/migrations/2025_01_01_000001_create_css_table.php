<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('css', function (Blueprint $table) {
            $table->string('category', 20)->primary();
            $table->longText('content');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('css');
    }
};
