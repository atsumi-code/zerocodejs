<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class CmsController extends Controller
{
    private const ALLOWED_PAGES = ['default', 'about', 'services'];

    public function index(): RedirectResponse
    {
        return redirect()->route('cms.page.edit', ['page' => 'default']);
    }

    public function pageEdit(string $page): View|RedirectResponse
    {
        if (!in_array($page, self::ALLOWED_PAGES, true)) {
            abort(404);
        }
        $pageModel = Page::find($page);
        if (!$pageModel) {
            abort(404);
        }
        return view('cms.page', [
            'page' => $pageModel,
            'mode' => 'cms',
        ]);
    }

    public function newsIndex(): View
    {
        $news = News::orderByDesc('published_at')->orderByDesc('created_at')->get();
        return view('cms.news.index', ['news' => $news, 'mode' => 'cms']);
    }

    public function newsCreate(): View
    {
        return view('cms.news.create', ['mode' => 'cms']);
    }

    public function newsStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:500'],
            'slug' => ['nullable', 'string', 'max:200', 'regex:/^[a-z0-9\-]+$/', 'unique:news,slug'],
            'published_at' => ['nullable', 'date'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
        ]);
        $slug = $validated['slug'] ?? \Illuminate\Support\Str::slug($validated['title']);
        if (News::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . now()->format('YmdHis');
        }
        $news = News::create([
            'slug' => $slug,
            'title' => $validated['title'],
            'published_at' => $validated['published_at'] ?? null,
            'excerpt' => $validated['excerpt'] ?? null,
            'page_data' => [],
        ]);
        return redirect()->route('cms.news.edit', ['news' => $news->slug]);
    }

    public function newsEdit(News $news): View
    {
        return view('cms.news.edit', ['news' => $news, 'mode' => 'cms']);
    }

    public function newsUpdate(Request $request, News $news): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:500'],
            'slug' => ['required', 'string', 'max:200', 'regex:/^[a-z0-9\-]+$/', Rule::unique('news', 'slug')->ignore($news->id)],
            'published_at' => ['nullable', 'date'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
        ]);
        $news->title = $validated['title'];
        $news->slug = $validated['slug'];
        $news->published_at = $validated['published_at'] ?? null;
        $news->excerpt = $validated['excerpt'] ?? null;
        $news->save();
        return redirect()->route('cms.news.edit', ['news' => $news->slug]);
    }
}
