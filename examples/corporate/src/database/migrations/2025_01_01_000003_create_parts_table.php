<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parts', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('type_id', 100);
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->longText('body');
            $table->boolean('slot_only')->default(false);
            $table->json('slots')->nullable();
            $table->integer('sort_order')->default(0);
            $table->foreign('type_id')->references('id')->on('types')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parts');
    }
};
