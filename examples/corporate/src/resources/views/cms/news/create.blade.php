@extends('layouts.cms')

@section('title', '新規記事')

@section('content')
<h1>新規記事（基本情報）</h1>
<form method="post" action="{{ route('cms.news.store') }}" style="max-width: 32rem;">
    @csrf
    <div style="margin-bottom: 1rem;">
        <label for="title">タイトル <span style="color: #c00;">*</span></label><br>
        <input type="text" id="title" name="title" value="{{ old('title') }}" required maxlength="500" style="width: 100%; padding: 0.25rem;">
        @error('title')
            <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
        @enderror
    </div>
    <div style="margin-bottom: 1rem;">
        <label for="slug">スラッグ（URL用・未入力時はタイトルから自動生成）</label><br>
        <input type="text" id="slug" name="slug" value="{{ old('slug') }}" maxlength="200" pattern="[a-z0-9\-]+" placeholder="例: my-news" style="width: 100%; padding: 0.25rem;">
        @error('slug')
            <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
        @enderror
    </div>
    <div style="margin-bottom: 1rem;">
        <label for="published_at">公開日</label><br>
        <input type="date" id="published_at" name="published_at" value="{{ old('published_at') }}" style="padding: 0.25rem;">
        @error('published_at')
            <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
        @enderror
    </div>
    <div style="margin-bottom: 1rem;">
        <label for="excerpt">抜粋</label><br>
        <textarea id="excerpt" name="excerpt" rows="3" maxlength="1000" style="width: 100%; padding: 0.25rem;">{{ old('excerpt') }}</textarea>
        @error('excerpt')
            <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
        @enderror
    </div>
    <button type="submit">作成して編集画面へ</button>
</form>
@endsection
