<style>
.page-edit-basic { margin-bottom: 1rem; }
.page-edit-basic .page-edit-basic__message { font-size: 0.875rem; color: #0a6b0a; margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: #e8f5e9; border-radius: 4px; }
.page-edit-basic details { border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; }
.page-edit-basic summary { padding: 0.5rem 0.75rem; cursor: pointer; font-size: 0.9rem; color: #444; list-style: none; display: flex; align-items: center; gap: 0.35rem; }
.page-edit-basic summary::-webkit-details-marker { display: none; }
.page-edit-basic summary::before { content: ''; display: inline-block; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #666; transition: transform 0.2s; }
.page-edit-basic details[open] summary::before { transform: rotate(180deg); }
.page-edit-basic__form { padding: 0.75rem 1rem 1rem; border-top: 1px solid #eee; }
.page-edit-basic__row { margin-bottom: 0.75rem; }
.page-edit-basic__row:last-of-type { margin-bottom: 1rem; }
.page-edit-basic label { display: block; font-size: 0.8rem; color: #555; margin-bottom: 0.25rem; }
.page-edit-basic input[type="text"], .page-edit-basic input[type="date"], .page-edit-basic textarea { width: 100%; max-width: 28rem; padding: 0.4rem 0.5rem; font-size: 0.9rem; border: 1px solid #ccc; border-radius: 4px; }
.page-edit-basic input:focus, .page-edit-basic textarea:focus { outline: none; border-color: #1a1a2e; }
.page-edit-basic textarea { resize: vertical; min-height: 2.5rem; }
.page-edit-basic .page-edit-basic__error { font-size: 0.8rem; color: #c00; margin-top: 0.2rem; }
.page-edit-basic .page-edit-basic__btn { font-size: 0.875rem; padding: 0.4rem 0.75rem; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; }
.page-edit-basic .page-edit-basic__btn:hover { background: #e5e5e5; }
</style>

<div class="page-edit-basic">
    @if (session('message'))
        <p class="page-edit-basic__message" role="status">{{ session('message') }}</p>
    @endif
    <details>
        <summary>基本情報（タイトル・スラッグ・公開日・抜粋）</summary>
        <form method="post" action="{{ route($updateRoute, $news) }}" class="page-edit-basic__form">
            @csrf
            @method('put')
            <div class="page-edit-basic__row">
                <label for="news-title">タイトル <span style="color: #c00;">*</span></label>
                <input type="text" id="news-title" name="title" value="{{ old('title', $news->title) }}" required maxlength="500">
                @error('title')
                    <span class="page-edit-basic__error">{{ $message }}</span>
                @enderror
            </div>
            <div class="page-edit-basic__row">
                <label for="news-slug">スラッグ（URL） <span style="color: #c00;">*</span></label>
                <input type="text" id="news-slug" name="slug" value="{{ old('slug', $news->slug) }}" required maxlength="200" pattern="[a-z0-9\-]+">
                @error('slug')
                    <span class="page-edit-basic__error">{{ $message }}</span>
                @enderror
            </div>
            <div class="page-edit-basic__row">
                <label for="news-published_at">公開日</label>
                <input type="date" id="news-published_at" name="published_at" value="{{ old('published_at', $news->published_at?->format('Y-m-d')) }}">
                @error('published_at')
                    <span class="page-edit-basic__error">{{ $message }}</span>
                @enderror
            </div>
            <div class="page-edit-basic__row">
                <label for="news-excerpt">抜粋</label>
                <textarea id="news-excerpt" name="excerpt" rows="3" maxlength="1000">{{ old('excerpt', $news->excerpt) }}</textarea>
                @error('excerpt')
                    <span class="page-edit-basic__error">{{ $message }}</span>
                @enderror
            </div>
            <button type="submit" class="page-edit-basic__btn">保存</button>
        </form>
    </details>
</div>
