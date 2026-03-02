@extends('layouts.app')

@section('title', $news->title . ' — ' . config('app.name'))

@section('content')
<div class="p-page-shell">
    <div class="l-container">
        @if ($news->published_at)
            <p class="p-meta">{{ $news->published_at->format('Y年n月j日') }}</p>
        @endif
        <h1 class="p-page-title">{{ $news->title }}</h1>
        @if ($news->excerpt)
            <p class="p-meta">{{ $news->excerpt }}</p>
        @endif
    </div>
    <div class="content">
        @include('partials.zerocode-public-render', ['pageId' => null, 'newsSlug' => $news->slug])
    </div>
    <div class="l-container">
        <p><a href="{{ url('/news') }}" class="p-news-back-link">← 新着情報一覧へ</a></p>
    </div>
</div>
@endsection
