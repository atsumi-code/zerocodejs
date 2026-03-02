@extends('layouts.cms')

@section('title', $page->title . ' の編集')

@section('content')
<div class="l-container">
    @include('partials.page-basic-info', ['page' => $page, 'updateRoute' => 'cms.page.update'])
</div>
<div id="zcode-edit-container" data-page-id="{{ $page->id }}" data-mode="cms">
    <zcode-cms locale="ja">
        @include('partials.zerocode-css-slot', ['pageId' => $page->id])
    </zcode-cms>
</div>
@include('partials.zerocode-scripts', ['componentTag' => 'zcode-cms'])
@endsection
