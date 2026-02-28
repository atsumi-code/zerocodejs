# コーポレート事例 — 構成と流れ

このドキュメントでは、コーポレート事例の「公開」「管理」「保存」「新規作成」の構成と処理の流れをまとめます。

---

## 1. 概要

- **公開**: 固定ページ（/, /about, /services）と新着（/news, /news/{slug}）は Blade で表示。コンテンツ部分は ZeroCode の `page_data` をレンダリング。
- **管理**: /admin（制作会社・zcode-editor）と /cms（依頼会社・zcode-cms）を分離。URL で編集対象（固定ページ or 新着記事）を指定。
- **データ**: 基本情報は Laravel/DB、コンテンツは `page_data`（ZeroCode）。同一項目を二重管理しない。

---

## 2. URL とルーティング

### 公開

| パス | 処理 |
|------|------|
| GET / | トップ（pages.id=default） |
| GET /about | 会社概要（pages.id=about） |
| GET /services | 事業内容（pages.id=services） |
| GET /news | 新着一覧（Blade。news のメタ一覧） |
| GET /news/{news:slug} | 記事詳細（ルートモデルバインディングで News 取得、page_data を表示） |
| GET /contact | お問い合わせ（Blade のみ） |
| GET /privacy | プライバシーポリシー（Blade のみ） |

### 管理（admin）

| パス | 処理 |
|------|------|
| GET /admin | リダイレクト or 一覧 |
| GET /admin/page/{page} | 固定ページ編集（page = default \| about \| services） |
| GET /admin/news | 新着一覧＋新規作成リンク |
| GET /admin/news/create | 新着の基本情報フォーム |
| POST /admin/news | 新着 1 件作成 → 編集画面へリダイレクト |
| GET /admin/news/{news:slug} | 新着記事の編集（zcode-editor） |

### 管理（cms）

| パス | 処理 |
|------|------|
| GET /cms | リダイレクト or 一覧 |
| GET /cms/page/{page} | 固定ページ編集（コンテンツのみ） |
| GET /cms/news | 新着一覧＋新規作成 |
| GET /cms/news/create | 新着の基本情報フォーム |
| POST /cms/news | 新着 1 件作成（依頼会社も可） |
| GET /cms/news/{news:slug} | 新着記事の編集（zcode-cms） |

---

## 3. データの構成

### テーブル

- **pages**: 固定ページ。id, slug, title, meta_description, sort_order, page_data（JSON）
- **news**: 新着記事。id, slug, title, published_at, excerpt, page_data（JSON）
- **css, types, parts, images**: ZeroCode 共通（共通 1 セットで利用）

### ZeroCodeData の組み立て

- 固定ページ表示・編集時: `page` = pages.page_data、css/parts/images は共通から取得。
- 新着記事表示・編集時: `page` = news.page_data、css/parts/images は共通から取得。
- いずれも ZeroCode が受け取る形は `{ page: ComponentData[], css, parts, images }` で統一。

---

## 4. API

### GET /api/data

- `?page=about` → 固定ページ about の ZeroCodeData。
- `?news=slug` → 新着記事（slug）の ZeroCodeData。

### POST /api/save

- body: `{ target, source, page_id?, news_id?, data }`
- 固定ページのコンテンツ更新: target=page, page_id=about など。pages.page_data を更新。
- 新着のコンテンツ更新: target=page, news_id=123 など。news.page_data を更新。
- source が cms のときは、コンテンツ（page_data）以外の target（パーツ・画像など）は拒否。

### POST /api/news

- body: `{ title, slug?, published_at?, excerpt }`（基本情報のみ）
- news に 1 行挿入。page_data は空配列 or デフォルト。
- レスポンスで slug 等を返し、編集画面（/admin/news/{slug} または /cms/news/{slug}）へ誘導。

---

## 5. 実装の流れ（フェーズ）

1. **フェーズ1**: Docker・Laravel 初期化、マイグレーション（pages, news, css, types, parts, images）、シーダー
2. **フェーズ2**: 公開ルート・管理画面ルート・Blade 骨子
3. **フェーズ3**: 静的 HTML/CSS → パーツ化・テンプレート記法、初期 page_data
4. **フェーズ4**: API（data, save, news 作成）、SaveRequest、zerocode-api.js（CSRF・page_id/news_id・source）
5. **フェーズ5**: 基本情報編集フォーム、お問い合わせ送信
6. **フェーズ6**: 動作確認、README

---

## 6. ルートモデルバインディング

- **新着情報のみ**使用: `/news/{news:slug}` で News モデルを slug から解決。記事追加時は DB に 1 行足すだけでよく、ルートの追加は不要。
- 固定ページは `/`, `/about`, `/services` を個別ルートで定義。
