<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CmsController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home']);
Route::get('/about', fn () => app(PageController::class)->show('about'));
Route::get('/services', fn () => app(PageController::class)->show('services'));

Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{news:slug}', [NewsController::class, 'show']);

Route::get('/contact', [ContactController::class, 'show'])->name('contact');
Route::post('/contact', [ContactController::class, 'submit'])->name('contact.submit');
Route::view('/privacy', 'privacy');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index']);
    Route::get('/page/{page}', [AdminController::class, 'pageEdit'])->name('page.edit');
    Route::get('/news', [AdminController::class, 'newsIndex'])->name('news.index');
    Route::get('/news/create', [AdminController::class, 'newsCreate'])->name('news.create');
    Route::post('/news', [AdminController::class, 'newsStore'])->name('news.store');
    Route::get('/news/{news:slug}', [AdminController::class, 'newsEdit'])->name('news.edit');
    Route::put('/news/{news:slug}', [AdminController::class, 'newsUpdate'])->name('news.update');
});

Route::prefix('cms')->name('cms.')->group(function () {
    Route::get('/', [CmsController::class, 'index']);
    Route::get('/page/{page}', [CmsController::class, 'pageEdit'])->name('page.edit');
    Route::get('/news', [CmsController::class, 'newsIndex'])->name('news.index');
    Route::get('/news/create', [CmsController::class, 'newsCreate'])->name('news.create');
    Route::post('/news', [CmsController::class, 'newsStore'])->name('news.store');
    Route::get('/news/{news:slug}', [CmsController::class, 'newsEdit'])->name('news.edit');
    Route::put('/news/{news:slug}', [CmsController::class, 'newsUpdate'])->name('news.update');
});
