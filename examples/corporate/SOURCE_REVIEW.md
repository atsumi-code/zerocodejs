# コーポレート事例 — ソース確認メモ

## .gitignore が複数ある理由

`examples/corporate/src/` は **Laravel の標準プロジェクト**（`composer create-project laravel/laravel`）をそのまま使っています。Laravel では次のように **複数箇所に .gitignore を置く構成** になっています。

### 一覧と役割

| 場所 | 役割 |
|------|------|
| **src/.gitignore** | プロジェクト全体。`vendor/`, `.env`, `node_modules/`, `public/build`, `public/hot`, `storage/*.key` など **リポジトリに含めたくないファイル** を指定。 |
| **src/storage/app/.gitignore** | `storage/app/` 直下のファイルを無視しつつ、`private/` と `public/` ディレクトリは存在だけ保持（中身は次の .gitignore で無視）。 |
| **src/storage/app/public/.gitignore** | `*` と `!.gitignore` で「このディレクトリ内の全ファイルを無視し、.gitignore だけは追跡」。アップロードファイル等をコミットしないため。 |
| **src/storage/app/private/.gitignore** | 上と同じパターン。非公開のアップロード用。 |
| **src/storage/framework/.gitignore** | フレームワークが生成するファイル（`compiled.php`, `config.php`, `routes.php`, `schedule-*` など）を無視。 |
| **src/storage/framework/views/** | コンパイル済み Blade を無視（`*` + `!.gitignore`）。 |
| **src/storage/framework/sessions/** | セッションファイルを無視。 |
| **src/storage/framework/cache/** | キャッシュファイルを無視（`data/` は子の .gitignore で同様）。 |
| **src/storage/framework/testing/** | テスト用ストレージを無視。 |
| **src/storage/logs/.gitignore** | ログファイルを無視（`*` + `!.gitignore`）。 |
| **src/bootstrap/cache/.gitignore** | ブートストラップキャッシュを無視（`*` + `!.gitignore`）。 |
| **src/database/.gitignore** | `*.sqlite*` で SQLite ファイルを無視。 |

### なぜ「このディレクトリだけ .gitignore を残す」のか

Git は **空のディレクトリを追跡しません**。Laravel は「このディレクトリは存在してほしいが、中身はコミットしたくない」ために、各ディレクトリに

- `*`（ここにあるファイルはすべて無視）
- `!.gitignore`（ただし .gitignore は追跡する）

を書いた .gitignore を置いています。こうすると「中身は無視されるが .gitignore がコミットされる」ので、ディレクトリ構造がリポジトリに残ります。

**結論**: これらは Laravel の標準構成で、削除や統合は不要です。リポジトリルートの .gitignore とは別の役割（Laravel プロジェクト内の無視対象）を持っています。

---

## ソース構成の確認

### ルート（examples/corporate/）

- `docker-compose.yml` — app + nginx + mysql + phpmyadmin
- `Dockerfile` — PHP 8.2-fpm + Composer + 拡張
- `docker/nginx/default.conf` — Nginx 設定
- `.env.example` — Docker 用の環境変数例
- `README.md`, `SETUP.md`, `FLOW.md` — ドキュメント

### Laravel 本体（src/）

| 区分 | 内容 |
|------|------|
| **ルート** | `web.php`（公開・admin・cms・contact）, `api.php`（/api/data, /api/save）, `bootstrap/app.php`（api ルート読み込み） |
| **コントローラー** | PageController, NewsController, ContactController / AdminController, CmsController / Api\ZeroCodeController |
| **モデル** | Page（id 文字列）, News（slug でルートバインディング） |
| **サービス** | ZeroCodeDataService（ZeroCodeData 組み立て） |
| **マイグレーション** | users, cache, jobs, sessions（Laravel 標準）, css, types, parts, images, pages, news（コーポレート用） |
| **シーダー** | Css, Types, Parts, Images, Pages, NewsSeeder |
| **ビュー** | layouts/app, admin, cms / page, contact, privacy / news/index, show / admin/news/*, cms/news/* / partials（zerocode-scripts, zerocode-public-render） |
| **公開 JS** | `public/js/zerocode-api.js`（API 連携） |

### 整理・注意点

- **PageController::show** — `$id` で about/services を受け取る。ルートはクロージャで `show('about')` 等を指定している。
- **Admin / Cms** — コントローラーとビューがほぼ同じ構造で、mode と view パスだけ違う。重複は許容範囲。
- **welcome.blade.php** — Laravel デフォルトのまま。ルートでは使っていない（`/` は PageController::home）。残しておいても害はない。
- **zerocode_corporate** — `src/` 直下に SQLite ファイル（テストや DB_CONNECTION=sqlite で生成された可能性）が存在することがある。コミット対象にしないよう .gitignore に追加し、既存ファイルは削除してよい。

---

## 推奨する整理

1. **src/.gitignore** に `zerocode_corporate` と `*.sqlite` を追加し、プロジェクトルートにできる SQLite を無視する。
2. **src/zerocode_corporate** が存在する場合は削除する（ローカルで必要な場合は再生成される）。
3. 上記以外は、Laravel 標準の .gitignore を削除・統合する必要はない。
