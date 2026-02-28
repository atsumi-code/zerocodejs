@extends('layouts.admin')

@section('title', '新着情報')

@section('content')
<h1>新着情報</h1>
<p><a href="{{ route('admin.news.create') }}">新規記事を作成</a></p>
@if ($news->isEmpty())
    <p>記事はまだありません。</p>
@else
    <ul style="list-style: none; padding: 0;">
        @foreach ($news as $item)
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                <a href="{{ route('admin.news.edit', $item) }}">{{ $item->title }}</a>
                @if ($item->published_at)
                    <span style="color: #666; font-size: 0.9rem;"> — {{ $item->published_at->format('Y.m.d') }}</span>
                @endif
            </li>
        @endforeach
    </ul>
@endif
@endsection
