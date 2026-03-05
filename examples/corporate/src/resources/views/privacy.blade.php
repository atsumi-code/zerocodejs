@extends('layouts.app')

@section('title', 'プライバシーポリシー — ' . config('app.name'))

@section('content')
<div class="p-page-shell">
    <div class="l-container">
        <h1 class="p-page-title">プライバシーポリシー（デモ用）</h1>
        <div class="p-policy-card">
            <p>このサイトは ZeroCode.js のデモです。実在の会社・団体はなく、以下はサンプル文です。お問い合わせ送信はデモ用の挙動のみで、実在の窓口には届きません。</p>
            <h2>1. デモサイトについて</h2>
            <p>お問い合わせフォームは動作確認用です。送信しても実在の窓口には届かず、個人情報が実務で利用されることはありません。</p>
            <h2>2. 利用目的（サンプル文）</h2>
            <p>デモのため、送信内容が実務で利用されることはありません。</p>
            <h2>3. 第三者提供（サンプル文）</h2>
            <p>本デモサイトでは実在の個人情報取扱いを行いません。</p>
            <h2>4. お問い合わせ窓口</h2>
            <p>実在の窓口はありません。<a href="{{ url('/contact') }}">お問い合わせ（デモ）</a>は ZeroCode.js のフォーム動作確認用です。</p>
        </div>
    </div>
</div>
@endsection
