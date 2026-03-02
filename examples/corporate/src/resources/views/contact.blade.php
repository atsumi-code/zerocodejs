@extends('layouts.app')

@section('title', 'お問い合わせ — ' . config('app.name'))

@section('content')
<div class="p-page-shell">
    <div class="l-container">
        <h1 class="p-page-title">お問い合わせ</h1>
        <div class="p-contact-card">
            <p class="p-contact-intro">ご相談・ご質問は以下フォームよりお気軽にお送りください。担当者が1営業日以内を目安にご連絡いたします。</p>

            @if (session('contact_sent'))
                <p class="c-alert--success">お問い合わせを受け付けました。ご連絡ありがとうございます。</p>
            @else
                <form method="post" action="{{ route('contact.submit') }}">
                    @csrf
                    <div class="c-form__group">
                        <label for="name">お名前 <span class="c-form__required">*</span></label>
                        <input type="text" id="name" name="name" value="{{ old('name') }}" required maxlength="200">
                        @error('name')
                            <span class="c-form__error">{{ $message }}</span>
                        @enderror
                    </div>
                    <div class="c-form__group">
                        <label for="email">メールアドレス <span class="c-form__required">*</span></label>
                        <input type="email" id="email" name="email" value="{{ old('email') }}" required>
                        @error('email')
                            <span class="c-form__error">{{ $message }}</span>
                        @enderror
                    </div>
                    <div class="c-form__group">
                        <label for="message">お問い合わせ内容 <span class="c-form__required">*</span></label>
                        <textarea id="message" name="message" rows="6" required maxlength="2000">{{ old('message') }}</textarea>
                        @error('message')
                            <span class="c-form__error">{{ $message }}</span>
                        @enderror
                    </div>
                    <button type="submit" class="c-btn c-btn--primary c-btn--lg">送信する</button>
                </form>
            @endif
        </div>
    </div>
</div>
@endsection
