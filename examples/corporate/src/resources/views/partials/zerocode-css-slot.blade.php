<link slot="css" rel="stylesheet" href="{{ asset('css/common.css') }}">
@if(isset($pageId))
@php
  $pageCssPath = $pageId === 'default' ? 'css/page.css' : $pageId . '/css/page.css';
@endphp
<link slot="css" rel="stylesheet" href="{{ asset($pageCssPath) }}">
@endif
