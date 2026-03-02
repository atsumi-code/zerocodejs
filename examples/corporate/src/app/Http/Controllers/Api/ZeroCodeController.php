<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveRequest;
use App\Http\Requests\StoreNewsRequest;
use App\Models\News;
use App\Models\Page;
use App\Services\ZeroCodeDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ZeroCodeController extends Controller
{
    public function __construct(
        private ZeroCodeDataService $dataService
    ) {
    }

    public function data(Request $request): JsonResponse
    {
        $page = $request->query('page');
        $news = $request->query('news');
        if ($page !== null && $page !== '') {
            $pageModel = Page::find($page);
            if (!$pageModel) {
                return response()->json(['error' => 'Page not found'], 404);
            }
            return response()->json($this->dataService->getDataForPage($page));
        }
        if ($news !== null && $news !== '') {
            $newsModel = News::where('slug', $news)->first();
            if (!$newsModel) {
                return response()->json(['error' => 'News not found'], 404);
            }
            return response()->json($this->dataService->getDataForNews($news));
        }
        return response()->json(['error' => 'Missing page or news parameter'], 400);
    }

    public function save(SaveRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $source = $validated['source'];
        $target = $validated['target'];
        if ($source === 'cms' && $target !== 'page') {
            return response()->json([
                'ok' => false,
                'errors' => [['message' => 'CMS can only save page content']],
            ], 403);
        }
        $pageId = $validated['page_id'] ?? null;
        $newsId = $validated['news_id'] ?? null;
        if ($pageId === null && $newsId === null) {
            return response()->json([
                'ok' => false,
                'errors' => [['message' => 'Either page_id or news_id is required']],
            ], 400);
        }
        if ($pageId !== null && $newsId !== null) {
            return response()->json([
                'ok' => false,
                'errors' => [['message' => 'Specify either page_id or news_id, not both']],
            ], 400);
        }
        $data = $validated['data'];
        if ($pageId !== null) {
            $page = Page::find($pageId);
            if (!$page) {
                return response()->json(['error' => 'Page not found'], 404);
            }
            $page->page_data = $data;
            $page->save();
            return response()->json(['ok' => true]);
        }
        $news = News::find($newsId);
        if (!$news) {
            return response()->json(['error' => 'News not found'], 404);
        }
        $news->page_data = $data;
        $news->save();
        return response()->json(['ok' => true]);
    }

    public function newsStore(StoreNewsRequest $request): JsonResponse
    {
        $validated = $request->validated();
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
        return response()->json([
            'ok' => true,
            'id' => $news->id,
            'slug' => $news->slug,
        ], 201);
    }
}
