@extends('layouts.app')

@section('title', $news->title . ' — ' . config('app.name'))

@section('content')
<div class="container">
    @if ($news->published_at)
        <p style="color: #666; font-size: 0.9rem;">{{ $news->published_at->format('Y年n月j日') }}</p>
    @endif
    <h1>{{ $news->title }}</h1>
    @if ($news->excerpt)
        <p class="excerpt">{{ $news->excerpt }}</p>
    @endif
    <div class="content">
        @include('partials.zerocode-public-render', ['pageId' => null, 'newsSlug' => $news->slug])
    </div>
    <p><a href="{{ url('/news') }}">← 新着情報一覧へ</a></p>
</div>
@endsection
