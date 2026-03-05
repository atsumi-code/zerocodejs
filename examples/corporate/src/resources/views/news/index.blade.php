@extends('layouts.app')

@section('title', '新着情報 — ' . config('app.name'))

@section('content')
<div class="p-page-shell">
    <div class="l-container">
        <h1 class="p-page-title">新着情報（デモ用サンプル）</h1>
        <p class="p-meta">表示されている記事はすべてデモ用のサンプルです。実在のニュースではありません。</p>
        @if ($news->isEmpty())
            <div class="p-contact-card">
                <p>記事はまだありません。</p>
            </div>
        @else
            <ul class="p-news-archive">
                @foreach ($news as $item)
                    <li class="p-news-archive__item">
                        <a href="{{ url('/news/' . $item->slug) }}" class="p-news-archive__link">
                            <div class="p-news-archive__head">
                                <h2 class="p-news-archive__title">{{ $item->title }}</h2>
                                @if ($item->published_at)
                                    <span class="p-news-archive__date">{{ $item->published_at->format('Y.m.d') }}</span>
                                @endif
                            </div>
                            @if ($item->excerpt)
                                <p class="p-news-archive__excerpt">{{ Str::limit($item->excerpt, 100) }}</p>
                            @endif
                        </a>
                    </li>
                @endforeach
            </ul>
        @endif
    </div>
</div>
@endsection
