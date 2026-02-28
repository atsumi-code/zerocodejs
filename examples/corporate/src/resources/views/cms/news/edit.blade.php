@extends('layouts.cms')

@section('title', $news->title . ' の編集')

@section('content')
<h1>記事の編集</h1>
<p><a href="{{ route('cms.news.index') }}">← 一覧へ</a></p>

<details open style="margin-bottom: 1.5rem;">
    <summary style="cursor: pointer; font-weight: bold;">基本情報</summary>
    <form method="post" action="{{ route('cms.news.update', $news) }}" style="max-width: 32rem; margin-top: 0.5rem;">
        @method('PUT')
        @csrf
        <div style="margin-bottom: 1rem;">
            <label for="title">タイトル <span style="color: #c00;">*</span></label><br>
            <input type="text" id="title" name="title" value="{{ old('title', $news->title) }}" required maxlength="500" style="width: 100%; padding: 0.25rem;">
            @error('title')
                <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
            @enderror
        </div>
        <div style="margin-bottom: 1rem;">
            <label for="slug">スラッグ（URL） <span style="color: #c00;">*</span></label><br>
            <input type="text" id="slug" name="slug" value="{{ old('slug', $news->slug) }}" required maxlength="200" pattern="[a-z0-9\-]+" style="width: 100%; padding: 0.25rem;">
            @error('slug')
                <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
            @enderror
        </div>
        <div style="margin-bottom: 1rem;">
            <label for="published_at">公開日</label><br>
            <input type="date" id="published_at" name="published_at" value="{{ old('published_at', $news->published_at?->format('Y-m-d')) }}" style="padding: 0.25rem;">
            @error('published_at')
                <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
            @enderror
        </div>
        <div style="margin-bottom: 1rem;">
            <label for="excerpt">抜粋</label><br>
            <textarea id="excerpt" name="excerpt" rows="3" maxlength="1000" style="width: 100%; padding: 0.25rem;">{{ old('excerpt', $news->excerpt) }}</textarea>
            @error('excerpt')
                <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
            @enderror
        </div>
        <button type="submit">基本情報を保存</button>
    </form>
</details>

<h2 style="font-size: 1.1rem; margin-bottom: 0.5rem;">本文（ZeroCode）</h2>
<div id="zcode-edit-container" data-news-id="{{ $news->id }}" data-news-slug="{{ $news->slug }}" data-mode="cms">
    <zcode-cms locale="ja" use-shadow-dom="false"></zcode-cms>
</div>
@include('partials.zerocode-scripts', ['componentTag' => 'zcode-cms'])
@endsection
