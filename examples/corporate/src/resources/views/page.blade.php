@extends('layouts.app')

@section('title', ($page->title ?? '') . ' — ' . config('app.name'))

@section('content')
<div class="container">
    <h1>{{ $page->title ?? 'ページ' }}</h1>
    @if ($page->meta_description)
        <p class="meta">{{ $page->meta_description }}</p>
    @endif
    <div class="content">
        @include('partials.zerocode-public-render', ['pageId' => $page->id, 'newsSlug' => null])
    </div>
</div>
@endsection
