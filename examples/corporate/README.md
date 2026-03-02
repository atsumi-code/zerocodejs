# コーポレートサイト事例（Laravel + MySQL）

ZeroCode.js でコーポレートサイトを編集・公開する事例です。**基本情報＝Laravel / コンテンツ＝ZeroCode** に分離し、制作会社（zcode-editor）と依頼会社（zcode-cms）で責務を分ける構成です。

## 実装状況

- **公開ページ**: `/`, `/about`, `/services`, `/news`, `/news/{slug}`, `/contact`, `/privacy` を Blade で表示。固定ページ・新着記事の本文は GET /api/data で取得し、クライアント側で `ZeroCode.renderToHtml` により HTML にレンダリングして表示。
- **管理画面**: `/admin`, `/admin/page/{page}`, `/admin/news`, `/admin/news/create`, `/admin/news/{slug}` と `/cms` 側の同構成を Blade で用意。固定ページ・新着記事の編集画面に zcode-editor（admin）／zcode-cms（cms）を組み込み済み。データは GET /api/data で取得、保存は POST /api/save で実行。リポジトリルートで `npm run build` 後に `docker compose up -d` すると dist が参照される。
- **API**: `GET /api/data?page=xxx`（固定ページ）・`GET /api/data?news=slug`（新着記事）で ZeroCodeData を返却。`POST /api/save` で `target=page` と `page_id` または `news_id`、`source`（cms|editor）を指定してコンテンツを保存。cms は page のみ保存可。
- **新着の基本情報**: 記事編集画面でタイトル・スラッグ・公開日・抜粋を編集し、`PUT /admin/news/{slug}` または `PUT /cms/news/{slug}` で保存可能。
- **お問い合わせ**: `/contact` で名前・メール・本文のフォームを表示。送信時はバリデーション後、完了メッセージを表示（メール送信処理は未実装。呼び出し側で実装）。
- **DB**: migrations / seeders 済み。固定ページ 3 件・新着サンプル 1 件をシード。phpMyAdmin で確認可能（`PMA_PORT` でポート指定）。

## 準備（初回のみ）

Docker・Composer・Laravel の環境構築は [SETUP.md](./SETUP.md) を参照してください。

- **Docker** と **Docker Compose** のインストール
- **Laravel プロジェクト**を `src/` に作成（`docker compose run --rm app composer create-project laravel/laravel . --no-interaction`）
- **Laravel の .env** を `src/.env` に用意し、DB 設定（DB_HOST=mysql など）を記述

## 起動方法

1. リポジトリルートで ZeroCode をビルド: `npm run build`
2. このディレクトリで: `docker compose up -d`（PHP + MySQL + Nginx）
3. ブラウザで `http://localhost:8080` を開く（ポートは `.env` の `APP_PORT` で変更可）

## ページ構成

| 種別 | URL | 内容 |
|------|-----|------|
| 固定ページ | `/` | トップ（default） |
| 固定ページ | `/about` | 会社概要 |
| 固定ページ | `/services` | 事業・サービス |
| 新着一覧 | `/news` | Blade で記事メタ一覧 |
| 新着記事 | `/news/{slug}` | 1 記事 = 1 本のコンテンツ（ルートモデルバインディング） |
| Blade のみ | `/contact` | お問い合わせ（ZeroCode 不使用） |
| Blade のみ | `/privacy` | プライバシーポリシー（ZeroCode 不使用） |

※ 末尾 `/` を付けた URL（例: `/about/`）は 301 で末尾なし（`/about`）に正規化します。

## 管理画面

| 画面 | URL | 用途 |
|------|-----|------|
| 管理（制作会社） | `/admin`, `/admin/page/{page}`, `/admin/news`, `/admin/news/create`, `/admin/news/{news:slug}` | zcode-editor で全編集 |
| CMS（依頼会社） | `/cms`, `/cms/page/{page}`, `/cms/news`, `/cms/news/create`, `/cms/news/{news:slug}` | zcode-cms でコンテンツのみ編集・新着も新規作成可 |

- 固定ページの `{page}` は `default` | `about` | `services`。
- 新着記事はルートモデルバインディングで `{news:slug}` を解決。

## データの分担

- **基本情報**（slug, title, 公開日, 抜粋 など）→ Laravel のフォーム or API で DB に保存。二元管理にはならない。
- **コンテンツ**（本文のパーツ構成）→ ZeroCode の `page_data`。zcode-editor / zcode-cms で編集。

## 処理の流れ

詳細は [FLOW.md](./FLOW.md) を参照。

## 動作確認

起動後、次を確認するとよいです。

| 確認項目 | 手順 |
|----------|------|
| 公開トップ | `http://localhost:8080/` でトップが表示される。編集していればコンテンツが表示される。 |
| 固定ページ | `/about`, `/services` が表示される。 |
| 新着一覧 | `/news` で一覧表示。シードで 1 件（サンプルお知らせ）が入っている。 |
| 新着記事 | `/news/sample-news` で記事詳細が表示される。 |
| お問い合わせ | `/contact` でフォームを表示し、送信すると「お問い合わせを受け付けました。」が表示される。 |
| 管理（admin） | `/admin` でトップ編集画面。固定ページ・新着の編集、新規記事作成、基本情報の更新ができる。 |
| CMS（cms） | `/cms` で依頼会社用編集。コンテンツ編集と新着の基本情報・本文の編集ができる。 |
| API | `GET http://localhost:8080/api/data?page=default` で JSON が返る。 |

既に DB をシード済みの場合は `NewsSeeder` を追加しただけなので、新規に 1 件挿入したいときはコンテナ内で `php artisan db:seed --class=NewsSeeder --force` を実行するか、管理画面で「新規記事を作成」から追加してください。

**見た目・ページデータ**: 新規に `db:seed` すると、トップ・会社概要・事業内容にヒーロー・テキスト・CTA のパーツと文言が入ります。既存環境でデザインと各ページのデータをそろえるには、コンテナ内で `php artisan db:seed --force` を再実行するか、`CssSeeder`・`TypesSeeder`・`PartsSeeder`・`PagesSeeder` を順に実行してください（`PagesSeeder` は `updateOrInsert` で既存ページの `page_data` を上書きします）。

## 残りの実装（任意）

コーポレート事例の「必須フロー」は一通り実装済みです。以下は必要に応じて検討する項目です。

| 項目 | 内容 | 優先度 |
|------|------|--------|
| **フェーズ3の充実** | 公開用 CSS は `css/common.css`（共通）を全ページで読み込み。TOP は `css/page.css`（接頭辞なし・TOP のみ）、about は `about/css/page.css`、services は `services/css/page.css` をページ別に読み込み。CssSeeder は空でスタイルはファイル指定。 | 任意 |
| **固定ページの基本情報編集** | 固定ページの title・meta_description を管理画面で編集するフォームとルート（PUT /admin/page/{page}, PUT /cms/page/{page}）。編集画面の「基本情報」で保存可能。 | ✅ 実装済み |
| **SaveRequest** | `POST /api/save` のバリデーションを `App\Http\Requests\SaveRequest` に切り出し。 | ✅ 実装済み |
| **POST /api/news** | 新着を REST API で作成するエンドポイント（`POST /api/news`）。title, slug（任意）, published_at, excerpt で作成し、id / slug を JSON で返却。 | ✅ 実装済み |
| **お問い合わせのメール送信** | 送信内容をメール送信または DB 保存する処理。バリデーション・完了表示は実装済み。 | 呼び出し側で実装 |
| **認証** | 計画では「認証なし」。/admin や /cms を保護したい場合は Laravel Breeze 等を別途導入。 | 要件次第 |

## 関連

- 全体の計画・TODO: リポジトリルートの [EXAMPLES_PLAN.md](../../EXAMPLES_PLAN.md)
