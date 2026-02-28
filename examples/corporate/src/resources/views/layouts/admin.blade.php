<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', '管理') — 制作会社</title>
    <style>
        body { font-family: sans-serif; margin: 0; padding: 0; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
        nav { background: #1a1a2e; color: #eee; padding: 0.75rem 1rem; }
        nav a { color: #eee; margin-right: 1rem; text-decoration: none; }
        nav a:hover { text-decoration: underline; }
        nav .label { color: #999; font-size: 0.9rem; margin-right: 0.5rem; }
        main { padding: 1.5rem 0; min-height: 50vh; }
        #zcode-edit-container { min-height: 360px; margin-top: 1rem; }
    </style>
</head>
<body>
    <nav>
        <div class="container">
            <span class="label">管理（制作会社）</span>
            <a href="{{ route('admin.page.edit', 'default') }}">トップ</a>
            <a href="{{ route('admin.page.edit', 'about') }}">会社概要</a>
            <a href="{{ route('admin.page.edit', 'services') }}">事業内容</a>
            <a href="{{ route('admin.news.index') }}">新着情報</a>
            <a href="{{ route('admin.news.create') }}">新規記事</a>
            <a href="{{ url('/') }}" target="_blank">サイト表示</a>
        </div>
    </nav>
    <main>
        <div class="container">
            @yield('content')
        </div>
    </main>
</body>
</html>
