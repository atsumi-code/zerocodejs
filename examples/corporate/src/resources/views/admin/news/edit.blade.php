@extends('layouts.admin')

@section('title', $news->title . ' の編集')

@section('content')
<div class="l-container">
    <h1>記事の編集</h1>
    <p><a href="{{ route('admin.news.index') }}">← 一覧へ</a></p>

    @include('partials.news-basic-info', ['news' => $news, 'updateRoute' => 'admin.news.update'])

    <h2 style="font-size: 1.1rem; margin-bottom: 0.5rem;">本文（ZeroCode）</h2>
</div>
<div id="zcode-edit-container" data-news-id="{{ $news->id }}" data-news-slug="{{ $news->slug }}" data-mode="admin">
    <zcode-editor locale="ja">
        @include('partials.zerocode-css-slot')
    </zcode-editor>
</div>
@include('partials.zerocode-scripts', ['componentTag' => 'zcode-editor'])
@endsection
