@extends('layouts.app')

@section('title', ($page->title ?? '') . ' — ' . config('app.name'))

@php
  $pageCssPath = $page->id === 'default' ? 'css/page.css' : $page->id . '/css/page.css';
@endphp
@section('page_css')
    <link rel="stylesheet" href="{{ asset($pageCssPath) }}">
@endsection

@section('content')
<div class="content">
    @include('partials.zerocode-public-render', ['pageId' => $page->id, 'newsSlug' => null])
</div>
@endsection
