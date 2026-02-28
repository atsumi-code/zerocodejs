@extends('layouts.app')

@section('title', '新着情報 — ' . config('app.name'))

@section('content')
<div class="container">
    <h1>新着情報</h1>
    @if ($news->isEmpty())
        <p>記事はまだありません。</p>
    @else
        <ul style="list-style: none; padding: 0;">
            @foreach ($news as $item)
                <li style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">
                    <a href="{{ url('/news/' . $item->slug) }}" style="text-decoration: none; color: inherit;">
                        <strong>{{ $item->title }}</strong>
                        @if ($item->published_at)
                            <span style="color: #666; font-size: 0.9rem;"> — {{ $item->published_at->format('Y.m.d') }}</span>
                        @endif
                    </a>
                    @if ($item->excerpt)
                        <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: #555;">{{ Str::limit($item->excerpt, 100) }}</p>
                    @endif
                </li>
            @endforeach
        </ul>
    @endif
</div>
@endsection
