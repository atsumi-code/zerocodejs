@extends('layouts.admin')

@section('title', $page->title . ' の編集')

@section('content')
<div class="l-container">
    @include('partials.page-basic-info', ['page' => $page, 'updateRoute' => 'admin.page.update'])
</div>
<div id="zcode-edit-container" data-page-id="{{ $page->id }}" data-mode="admin">
    <zcode-editor locale="ja">
        @include('partials.zerocode-css-slot', ['pageId' => $page->id])
    </zcode-editor>
</div>
@include('partials.zerocode-scripts', ['componentTag' => 'zcode-editor'])
@endsection
