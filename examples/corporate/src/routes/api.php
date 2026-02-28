<?php

use App\Http\Controllers\Api\ZeroCodeController;
use Illuminate\Support\Facades\Route;

Route::get('/data', [ZeroCodeController::class, 'data']);
Route::post('/save', [ZeroCodeController::class, 'save']);
