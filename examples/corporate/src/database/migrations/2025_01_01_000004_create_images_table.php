<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('images', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('category', 20);
            $table->string('name', 200);
            $table->text('url');
            $table->string('mime_type', 50)->nullable();
            $table->boolean('needs_upload')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};
