<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\View\View;

class NewsController extends Controller
{
    public function index(): View
    {
        $news = News::orderByDesc('published_at')->orderByDesc('created_at')->get();
        return view('news.index', ['news' => $news]);
    }

    public function show(News $news): View
    {
        return view('news.show', ['news' => $news]);
    }
}
