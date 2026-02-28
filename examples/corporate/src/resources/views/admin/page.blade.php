@extends('layouts.admin')

@section('title', $page->title . ' の編集')

@section('content')
<h1>固定ページ: {{ $page->title }}</h1>
<p>ページID: {{ $page->id }}</p>
<div id="zcode-edit-container" data-page-id="{{ $page->id }}" data-mode="admin">
    <zcode-editor locale="ja" use-shadow-dom="false"></zcode-editor>
</div>
@include('partials.zerocode-scripts', ['componentTag' => 'zcode-editor'])
@endsection
