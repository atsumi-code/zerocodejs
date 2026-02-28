<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', config('app.name'))</title>
    <style>
        body { font-family: sans-serif; margin: 0; padding: 0; line-height: 1.6; }
        .container { max-width: 960px; margin: 0 auto; padding: 0 1rem; }
        nav { background: #1a1a2e; color: #eee; padding: 1rem; }
        nav a { color: #eee; margin-right: 1rem; text-decoration: none; }
        nav a:hover { text-decoration: underline; }
        main { padding: 2rem 0; min-height: 40vh; }
        footer { border-top: 1px solid #ddd; padding: 1rem; font-size: 0.9rem; color: #666; }
    </style>
</head>
<body>
    <nav>
        <div class="container">
            <a href="{{ url('/') }}">トップ</a>
            <a href="{{ url('/about') }}">会社概要</a>
            <a href="{{ url('/services') }}">事業内容</a>
            <a href="{{ url('/news') }}">新着情報</a>
            <a href="{{ url('/contact') }}">お問い合わせ</a>
        </div>
    </nav>
    <main>
        @yield('content')
    </main>
    <footer>
        <div class="container">
            <a href="{{ url('/privacy') }}">プライバシーポリシー</a>
        </div>
    </footer>
</body>
</html>
