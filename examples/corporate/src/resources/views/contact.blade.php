@extends('layouts.app')

@section('title', 'お問い合わせ — ' . config('app.name'))

@section('content')
<div class="container">
    <h1>お問い合わせ</h1>

    @if (session('contact_sent'))
        <p style="padding: 1rem; background: #e8f5e9; border-radius: 4px;">お問い合わせを受け付けました。</p>
    @else
        <form method="post" action="{{ route('contact.submit') }}" style="max-width: 28rem;">
            @csrf
            <div style="margin-bottom: 1rem;">
                <label for="name">お名前 <span style="color: #c00;">*</span></label><br>
                <input type="text" id="name" name="name" value="{{ old('name') }}" required maxlength="200" style="width: 100%; padding: 0.25rem;">
                @error('name')
                    <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
                @enderror
            </div>
            <div style="margin-bottom: 1rem;">
                <label for="email">メールアドレス <span style="color: #c00;">*</span></label><br>
                <input type="email" id="email" name="email" value="{{ old('email') }}" required style="width: 100%; padding: 0.25rem;">
                @error('email')
                    <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
                @enderror
            </div>
            <div style="margin-bottom: 1rem;">
                <label for="message">お問い合わせ内容 <span style="color: #c00;">*</span></label><br>
                <textarea id="message" name="message" rows="6" required maxlength="2000" style="width: 100%; padding: 0.25rem;">{{ old('message') }}</textarea>
                @error('message')
                    <span style="color: #c00; font-size: 0.9rem;">{{ $message }}</span>
                @enderror
            </div>
            <button type="submit">送信する</button>
        </form>
    @endif
</div>
@endsection
