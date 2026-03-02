<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', config('app.name'))</title>
    <link rel="stylesheet" href="{{ asset('css/common.css') }}">
    @yield('page_css')
</head>
<body>
    <header class="l-header">
        <div class="l-container">
            <div class="l-header__logo">
                <a href="{{ url('/') }}">{{ config('app.name', 'サンプル会社') }}</a>
            </div>
            <nav class="l-header__nav">
                <a href="{{ url('/') }}" class="{{ request()->is('/') || request()->is('') ? 'is-active' : '' }}">トップ</a>
                <a href="{{ url('/about') }}" class="{{ request()->is('about') ? 'is-active' : '' }}">会社概要</a>
                <a href="{{ url('/services') }}" class="{{ request()->is('services') ? 'is-active' : '' }}">事業内容</a>
                <a href="{{ url('/news') }}" class="{{ request()->is('news') || request()->is('news/*') ? 'is-active' : '' }}">新着情報</a>
                <a href="{{ url('/contact') }}" class="l-header__nav-link--cta {{ request()->is('contact') ? 'is-active' : '' }}">お問い合わせ</a>
            </nav>
        </div>
    </header>
    <main class="l-main">
        @yield('content')
    </main>
    <footer class="l-footer">
        <div class="l-container">
            <div class="l-footer__inner">
                <div class="l-footer__company">
                    <p class="l-footer__company-name">{{ config('app.name', 'サンプル株式会社') }}</p>
                    <p class="l-footer__company-address">〒100-0001 東京都千代田区例町1-2-3<br>TEL: 03-1234-5678</p>
                </div>
                <nav class="l-footer__nav">
                    <a href="{{ url('/') }}">トップ</a>
                    <a href="{{ url('/about') }}">会社概要</a>
                    <a href="{{ url('/services') }}">事業内容</a>
                    <a href="{{ url('/news') }}">新着情報</a>
                    <a href="{{ url('/contact') }}">お問い合わせ</a>
                    <a href="{{ url('/privacy') }}">プライバシーポリシー</a>
                </nav>
            </div>
            <p class="l-footer__copy">&copy; {{ date('Y') }} {{ config('app.name', 'サンプル株式会社') }}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
