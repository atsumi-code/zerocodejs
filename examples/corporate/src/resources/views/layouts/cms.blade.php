<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'CMS') — 依頼会社</title>
    <link rel="stylesheet" href="{{ asset('css/common.css') }}">
    <style>
        body { font-family: sans-serif; margin: 0; padding: 0; line-height: 1.6; }
        nav { background: #2d3748; color: #eee; padding: 0.75rem 1rem; }
        nav a { color: #eee; margin-right: 1rem; text-decoration: none; }
        nav a:hover { text-decoration: underline; }
        nav a.is-active { font-weight: 600; color: #fff; text-decoration: underline; }
        nav .label { color: #a0aec0; font-size: 0.9rem; margin-right: 0.5rem; }
        main { padding: 1.5rem 0; min-height: 50vh; }
        #zcode-edit-container { min-height: 360px; margin-top: 1rem; }
    </style>
</head>
<body>
    <nav>
        <div class="l-container">
            <span class="label">CMS（依頼会社）</span>
            <a href="{{ route('cms.page.edit', 'default') }}" class="{{ request()->routeIs('cms.page.edit') && request()->route('page') === 'default' ? 'is-active' : '' }}">トップ</a>
            <a href="{{ route('cms.page.edit', 'about') }}" class="{{ request()->routeIs('cms.page.edit') && request()->route('page') === 'about' ? 'is-active' : '' }}">会社概要</a>
            <a href="{{ route('cms.page.edit', 'services') }}" class="{{ request()->routeIs('cms.page.edit') && request()->route('page') === 'services' ? 'is-active' : '' }}">事業内容</a>
            <a href="{{ route('cms.news.index') }}" class="{{ request()->routeIs('cms.news.index') || request()->routeIs('cms.news.edit') ? 'is-active' : '' }}">新着情報</a>
            <a href="{{ route('cms.news.create') }}" class="{{ request()->routeIs('cms.news.create') ? 'is-active' : '' }}">新規記事</a>
            <a href="{{ url('/') }}" target="_blank">サイト表示</a>
        </div>
    </nav>
    <main>
        @yield('content')
    </main>
</body>
</html>
