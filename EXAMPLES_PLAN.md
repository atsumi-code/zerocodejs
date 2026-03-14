# ZeroCode.js 事例実装計画

> **このファイルの目的**: 3つの事例（LP / コーポレート / ポータル）の実装計画・仕様・TODOをまとめたドキュメントです。途中から作業を再開する際にも参照してください。

## 目次

- [概要](#概要)
- [3事例の構成](#3事例の構成)
- [ディレクトリ構成](#ディレクトリ構成)
- [事例1: LP](#事例1-lp)
- [事例2: コーポレート](#事例2-コーポレート)
- [事例3: ポータル](#事例3-ポータル)
- [デモサイトへの掲載](#デモサイトへの掲載)
- [共通方針](#共通方針)
- [TODO](#todo)

---

## 概要

ZeroCode.js の「バックエンド連携」を示す3つの事例を実装する。

- 各事例は**サイト種別・技術スタック・DB がすべて異なる**
- 各事例は**独立して動作**する（1つだけクローンしても完結する）
- デザインは**新規作成**（一般的なデザイン。外部テンプレートは使わない）
- パーツ化の範囲は**デザイン完成後に決定**する（まず静的 HTML を作り、確認後にパーツ化）

### 参考テンプレート（デザインの参考のみ。コードは流用しない）

| 事例         | 参考                  | セクション構成の参考                                          |
| ------------ | --------------------- | ------------------------------------------------------------- |
| LP           | tp_professionals1_red | ヒーロー、取扱分野、選ばれる理由、流れ、料金、お客様の声、FAQ |
| コーポレート | tp_biz62_red_photo    | ヒーロー（スライド）、ご案内カード、お知らせ、会社概要        |
| ポータル     | tp_portal1_pink       | カテゴリ検索、一覧ページ、サイドバー、お知らせ                |

---

## 3事例の構成

|                             | LP                                       | コーポレート                     | ポータル                         |
| --------------------------- | ---------------------------------------- | -------------------------------- | -------------------------------- |
| **フロント**                | 静的 HTML + CDN                          | Laravel Blade                    | Next.js                          |
| **バックエンド**            | Node.js + Express                        | Laravel（PHP）                   | Next.js API Routes               |
| **DB**                      | JSON ファイル                            | MySQL（Docker）                  | Supabase（PostgreSQL）           |
| **認証**                    | なし                                     | なし                             | Supabase Auth（master / owner）  |
| **ZeroCode コンポーネント** | `<zcode-editor>`                         | `<zcode-editor>` + `<zcode-cms>` | `<zcode-editor>` + `<zcode-cms>` |
| **起動方法**                | `npm start`                              | `docker compose up`              | Supabase 登録 → `npm run dev`    |
| **バリデーション**          | 最小限（型チェック + target 許可リスト） | 標準（Laravel FormRequest）      | 標準 + 権限チェック              |

### 技術の段階

```
LP（最もシンプル）→ コーポレート（実務標準）→ ポータル（モダン + 認証）
JSON ファイル    → MySQL                    → Supabase（PostgreSQL）
Express          → Laravel                  → Next.js
認証なし         → 認証なし                  → マルチログイン（master / owner）
```

---

## ディレクトリ構成

```
examples/
├── README.md                        ← 3事例の概要・比較表・選び方
│
├── lp/                              ← 事例1: LP
│   ├── README.md
│   ├── package.json                 (express)
│   ├── server.js                    (Express + JSON ファイル)
│   ├── data/
│   │   └── default-store.json       (初期データ)
│   └── public/
│       ├── index.html               (zcode-editor + CDN)
│       ├── css/style.css            (LP 用デザイン)
│       ├── images/                  (プレースホルダー画像)
│       └── js/zerocode-api.js       (save/load の API 連携)
│
├── corporate/                       ← 事例2: コーポレート
│   ├── README.md
│   ├── docker-compose.yml           (PHP + MySQL + Nginx)
│   ├── .env.example
│   ├── src/                         (Laravel プロジェクト)
│   │   ├── routes/
│   │   │   ├── web.php              (/ → 公開, /admin → 管理)
│   │   │   └── api.php              (/api/data, /api/save)
│   │   ├── app/Http/Controllers/
│   │   │   └── ZeroCodeController.php
│   │   ├── app/Http/Requests/
│   │   │   └── SaveRequest.php      (バリデーション)
│   │   ├── database/migrations/     (テーブル定義)
│   │   ├── database/seeders/        (初期データ)
│   │   ├── resources/views/
│   │   │   ├── layouts/app.blade.php
│   │   │   ├── admin.blade.php      (zcode-editor)
│   │   │   ├── cms.blade.php        (zcode-cms)
│   │   │   └── page.blade.php       (公開ページ)
│   │   └── public/
│   │       ├── css/style.css        (コーポレート用デザイン)
│   │       ├── images/
│   │       └── js/zerocode-api.js
│   └── db/
│       └── init.sql                 (Docker 初期化用)
│
│
│   ※ ポータル（Zeroportal）は別リポジトリ `zeroportal` で管理
│   （ZeroCode.js は npm 依存として参照。Vercel でホスティング）
```

---

## 事例1: LP

### 概要

- 1ページ完結のランディングページ
- 最もシンプルな構成で「ZeroCode.js + バックエンドの最小例」を示す

### セクション構成（参考: tp_professionals1_red）

1. ヒーロー（メイン画像 + キャッチコピー + CTA）
2. サービス紹介（カード形式 × 3〜6）
3. 選ばれる理由（番号付きリスト × 3）
4. ご利用の流れ（ステップ × 3〜4）
5. 料金プラン（カード × 3）
6. お客様の声（テスティモニアル × 2〜3）
7. よくある質問（FAQ アコーディオン × 3）
8. お問い合わせ CTA
9. フッター

### バックエンド仕様

- **GET /api/data** — `data/store.json`（なければ `default-store.json` をコピー）を返す
- **POST /api/save** — `{ target, data }` を受け取り、`store.json` の該当キーを更新
- **バリデーション（最小限）**:
  - target が許可リスト（10 種）に含まれるか
  - data が配列または文字列であること（target に応じて）
  - リクエストボディのサイズ制限（10MB）

### 実装の流れ

1. 静的 HTML/CSS を新規作成（一般的な LP デザイン）
2. ブラウザで確認 → パーツ化する箇所を決定
3. パーツ（テンプレート記法）に変換
4. Express サーバー（server.js）を実装
5. zerocode-api.js（save/load）を実装
6. default-store.json（初期データ）を作成
7. README.md を作成

---

## 事例2: コーポレート

### 概要

- 複数ページの企業サイト（最低限の構成: トップ・会社概要・事業内容・新着情報・お問い合わせ・プライバシーポリシー）
- Laravel + MySQL + Docker で「実務標準の構成」を示す
- **基本情報＝Laravel / コンテンツ＝ZeroCode** に分離（二元管理にならない）
- 制作会社（zcode-editor）と依頼会社（zcode-cms）で責務を分ける（受託イメージ）

### データの分担

| 項目               | 担当     | 入力・保存                                                                                         |
| ------------------ | -------- | -------------------------------------------------------------------------------------------------- |
| 基本情報           | Laravel  | slug, title, 公開日, 抜粋 など。Laravel のフォーム or API で DB カラムに保存                       |
| コンテンツ（本文） | ZeroCode | パーツの組み替え・テキスト・画像。`page_data` (JSON) として保存し、zcode-editor / zcode-cms で編集 |

### 公開ページ構成

| 種別       | ページ名 / 対象      | URL 例         | データ                                      |
| ---------- | -------------------- | -------------- | ------------------------------------------- |
| 固定ページ | default              | `/`            | pages テーブル（id=default, page_data）     |
| 固定ページ | about                | `/about/`      | pages（id=about）                           |
| 固定ページ | services             | `/services/`   | pages（id=services）                        |
| 新着一覧   | —                    | `/news/`       | Blade で記事メタ一覧表示                    |
| 新着記事   | 各記事               | `/news/{slug}` | news テーブル（ルートモデルバインディング） |
| Blade のみ | お問い合わせ         | `/contact/`    | ZeroCode 不使用（セキュリティ）             |
| Blade のみ | プライバシーポリシー | `/privacy/`    | ZeroCode 不使用                             |

### 管理画面の URL・構成

| 画面           | URL                       | コンポーネント | 役割                                        |
| -------------- | ------------------------- | -------------- | ------------------------------------------- |
| 管理トップ     | `/admin`                  | —              | リダイレクト or 一覧                        |
| 固定ページ編集 | `/admin/page/{page}`      | zcode-editor   | `{page}` = default \| about \| services     |
| 新着一覧       | `/admin/news`             | —              | 一覧＋新規作成リンク                        |
| 新着・新規作成 | `/admin/news/create`      | —              | 基本情報フォーム → POST で保存 → 編集画面へ |
| 新着・記事編集 | `/admin/news/{news:slug}` | zcode-editor   | ルートモデルバインディング                  |
| CMS トップ     | `/cms`                    | —              | リダイレクト or 一覧                        |
| 固定ページ編集 | `/cms/page/{page}`        | zcode-cms      | コンテンツのみ編集                          |
| 新着一覧       | `/cms/news`               | —              | 依頼会社も新規作成可                        |
| 新着・新規作成 | `/cms/news/create`        | —              | 基本情報フォーム                            |
| 新着・記事編集 | `/cms/news/{news:slug}`   | zcode-cms      | コンテンツのみ編集                          |

- ルートモデルバインディングは **新着情報（/news/{slug}）のみ**。固定ページは個別ルートで対応。

### DB 設計（MySQL）

```sql
-- 固定ページ（基本情報 + コンテンツ）
CREATE TABLE pages (
  id              VARCHAR(100) PRIMARY KEY,  -- 'default' | 'about' | 'services'
  slug            VARCHAR(200) NOT NULL,
  title           VARCHAR(500),
  meta_description TEXT,
  sort_order      INT DEFAULT 0,
  page_data       JSON,  -- ZeroCode のコンポーネント配列
  created_at      TIMESTAMP NULL,
  updated_at      TIMESTAMP NULL
);

-- 新着情報（基本情報 + コンテンツ）
CREATE TABLE news (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(200) NOT NULL UNIQUE,
  title        VARCHAR(500) NOT NULL,
  published_at DATE NULL,
  excerpt      TEXT,
  page_data    JSON,  -- ZeroCode のコンポーネント配列
  created_at   TIMESTAMP NULL,
  updated_at   TIMESTAMP NULL
);

-- CSS（ZeroCode 共通）
CREATE TABLE css (
  category VARCHAR(20) PRIMARY KEY,
  content  LONGTEXT
);

-- パーツのタイプ
CREATE TABLE types (
  id          VARCHAR(100) PRIMARY KEY,
  category    VARCHAR(20),
  type        VARCHAR(100),
  description TEXT,
  sort_order  INT DEFAULT 0
);

-- パーツ
CREATE TABLE parts (
  id          VARCHAR(100) PRIMARY KEY,
  type_id     VARCHAR(100),
  title       VARCHAR(200),
  description TEXT,
  body        LONGTEXT,
  slot_only   TINYINT DEFAULT 0,
  slots       JSON,
  sort_order  INT DEFAULT 0,
  FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE CASCADE
);

-- 画像
CREATE TABLE images (
  id           VARCHAR(100) PRIMARY KEY,
  category     VARCHAR(20),
  name         VARCHAR(200),
  url          TEXT,
  mime_type    VARCHAR(50),
  needs_upload TINYINT DEFAULT 0
);
```

### バックエンド仕様

- **GET /api/data?page=xxx** — 固定ページの ZeroCodeData 取得（page に pages.page_data、共通で css/parts/images）
- **GET /api/data?news=slug** — 新着記事の ZeroCodeData 取得（page に news.page_data）
- **POST /api/save** — `{ target, source, page_id?, news_id?, data }`。固定は page_id、新着は news_id で対象を指定。source が cms のときはコンテンツ（page_data）のみ保存可
- **POST /api/news** — 新着の新規作成（基本情報のみ）。作成後は slug 等を返して編集画面へ誘導
- **バリデーション（Laravel FormRequest）**: target 許可リスト、source と target の組み合わせ（cms からパーツ・画像保存を拒否）、data の型・サイズ、body サニタイズ、CSRF

### 実装の流れ

1. Docker 環境（PHP + MySQL + Nginx）を構築
2. Laravel プロジェクトを初期化
3. マイグレーション（pages, news, css, types, parts, images）+ シーダー
4. 公開ルート（/, /about, /services, /news, /news/{slug}, /contact, /privacy）と Blade
5. 管理画面ルート（/admin, /admin/page/{page}, /admin/news, /admin/news/create, /admin/news/{news:slug} と /cms 同様）
6. 静的 HTML/CSS を新規作成（コーポレートデザイン）
7. ブラウザで確認 → パーツ化する箇所を決定 → テンプレート記法に変換
8. API（data, save, news 作成）+ SaveRequest バリデーション
9. zerocode-api.js（CSRF 対応・page_id/news_id・source 付与）
10. 基本情報編集フォーム（任意）、お問い合わせフォーム送信処理
11. 動作確認・README.md

---

## 事例3: ポータル — Zeroportal（ゼロポータル / 愛称: ゼロポ）

### 概要

- **サービス名**: Zeroportal（ゼロポータル）、愛称: ゼロポ
- **リポジトリ**: 別リポジトリ `zeroportal`（プライベート）。ZeroCode.js は npm 依存として参照
- **ホスティング**: Vercel（無料枠、独自ドメイン検討中）
- **事例紹介**: ZeroCode.js 側のデモサイト・EXAMPLES_PLAN にリンクとスクリーンショットで掲載
- 地域・カテゴリ・駅で掲載者を探せるポータルサイト
- Next.js + Supabase で「モダンスタック + 認証」を示す
- 掲載者単位で編集可能。マスター / オーナーの権限分け
- コーポレートの「ページ単位」ではなく、「機能単位（ドメイン単位）」で ZeroCode を使う
- 掲載者（listing）= 店舗・フリーランス・スタジオ・スクールなど広義の事業者

### ビジネスモデル

- 掲載は無料
- オーナーは CMS パーツで自分のページを作成（レベル 1）
- よりデザイン性の高いページが必要なら、ポータルに掲載されている制作会社に依頼（レベル 2: 独自 HTML/CSS パーツ）
- さらに高度な機能が必要なら、管理者がカスタム実装で支援（レベル 3）

### 公開向け考慮事項

- **SEO**: meta tags、OGP（og:title, og:image 等）、sitemap.xml、robots.txt
- **セキュリティ**: rate limiting（API）、入力サニタイズ、CORS 設定、環境変数の管理
- **パフォーマンス**: Next.js Image 最適化、適切なキャッシュヘッダー、ISR/SSR の使い分け
- **エラーハンドリング**: カスタム 404/500 ページ、API エラーレスポンスの統一
- **ログ・監視**: Vercel Analytics（無料枠あり）、エラーログ
- **法的**: プライバシーポリシー、利用規約（必要に応じて）

### 仕様の詳細

詳細な仕様（URL構造・データモデル・API・検索ロジック・認証等）は **別リポジトリ `zeroportal` の `AGENTS.md`** に移植済み。
このファイルでは概要・TODOのみ管理する。

---

## デモサイトへの掲載

### 方針: 方法 B（スクリーンショット + 説明）

- GitHub Pages のデモサイトに「事例紹介」セクションを追加
- 各事例のスクリーンショット、技術スタック、構成図を掲載
- LP・コーポレートは「ローカルで試す」ボタンで GitHub の各事例 README へ誘導
- **ポータル（Zeroportal）は実稼働サイトへのリンクで紹介**（別リポジトリ・Vercel ホスティング）

### 実装

- `index.html`（デモサイトトップ）に事例セクションを追加
- 各事例のスクリーンショット画像を `public/images/examples/` に配置
- Zeroportal は実サイト URL と技術スタック紹介を掲載

---

## 共通方針

### デザイン

- 3事例とも**新規で HTML/CSS/JS を作成**（外部テンプレートは使わない）
- 一般的でシンプルなデザイン
- 画像は**プレースホルダー**（単色 + テキスト）または Unsplash（CC0）から使用
- レスポンシブ対応

### パーツ化の進め方

1. まず**静的な HTML/CSS** としてページを完成させる
2. ブラウザで確認してもらう
3. 「ここを編集可能にしたい」を決定
4. 該当箇所を **ZeroCode パーツ（テンプレート記法）に変換**

### バリデーション（段階的に深くする）

| 事例         | レベル      | 内容                                                                |
| ------------ | ----------- | ------------------------------------------------------------------- |
| LP           | 最小限      | target 許可リスト + 型チェック + サイズ制限                         |
| コーポレート | 標準        | 上記 + source 検証 + データ構造検証 + テンプレートサニタイズ + CSRF |
| ポータル     | 標準 + 権限 | 上記 + 認証チェック + 権限チェック（master / owner）                |

### save-request / save-result の流れ（全事例共通）

```
[ブラウザ]
  └─ <zcode-editor> or <zcode-cms>
       ├─ 表示時: GET /api/data → サーバーが DB から読んで返す
       ├─ 保存時: save-request イベント発火
       │    └─ zerocode-api.js が getData() で取得
       │         └─ targets ごとに POST /api/save
       │              └─ サーバーがバリデーション → DB に保存
       │                   └─ { ok: true } or { ok: false, errors: [...] }
       │                        └─ save-result イベントを発火
       └─ リセット: POST /api/reset（任意）→ 初期データに戻す
```

---

## TODO

### 事例1: LP

- [ ] **LP-1**: `examples/lp/` ディレクトリ作成、`package.json` 作成
- [ ] **LP-2**: 静的 HTML/CSS を新規作成（LP デザイン）
- [ ] **LP-3**: ブラウザで確認 → パーツ化する箇所を決定
- [ ] **LP-4**: パーツ（テンプレート記法）に変換、`default-store.json` 作成
- [ ] **LP-5**: `server.js` 実装（Express + JSON ファイル + バリデーション）
- [ ] **LP-6**: `js/zerocode-api.js` 実装（save/load の API 連携）
- [ ] **LP-7**: 動作確認（起動 → 編集 → 保存 → リロードでデータ維持）
- [ ] **LP-8**: `README.md` 作成

### 事例2: コーポレート

- [ ] **CORP-1**: `examples/corporate/` ディレクトリ作成
- [ ] **CORP-2**: `docker-compose.yml` 作成（PHP + MySQL + Nginx）
- [ ] **CORP-3**: Laravel プロジェクト初期化
- [ ] **CORP-4**: マイグレーション作成（pages, news, css, types, parts, images）
- [ ] **CORP-5**: シーダー作成（固定ページ 3 件・共通 parts/images/css・初期 page_data）
- [ ] **CORP-6**: 公開ルート・管理画面ルート・Blade 骨子（/, /about, /services, /news, /news/{slug}, /contact, /privacy, /admin/_, /cms/_）
- [ ] **CORP-7**: 静的 HTML/CSS を新規作成（コーポレートデザイン）
- [ ] **CORP-8**: ブラウザで確認 → パーツ化する箇所を決定 → テンプレート記法に変換
- [ ] **CORP-9**: API（GET /api/data, POST /api/save, POST /api/news）+ SaveRequest バリデーション
- [ ] **CORP-10**: zerocode-api.js 実装（CSRF・page_id/news_id・source 付与）
- [ ] **CORP-11**: 基本情報編集・お問い合わせフォーム（Laravel 側）
- [ ] **CORP-12**: 動作確認（Docker 起動 → 固定/新着の表示・編集・保存・新規作成・source 制限）
- [ ] **CORP-13**: README.md 作成

### 事例3: ポータル — Zeroportal（別リポジトリ `zeroportal`）

- [ ] **PORTAL-1**: 別リポジトリ `zeroportal` 作成（プライベート）、Next.js プロジェクト初期化
- [ ] **PORTAL-2**: Vercel と連携（GitHub → 自動デプロイ）
- [ ] **PORTAL-3**: Supabase プロジェクト作成 + マイグレーション（categories, regions, stations, groups, listings, listing_categories, profiles, pages, css, types, parts, images + RLS）
- [ ] **PORTAL-4**: 初期データ投入（カテゴリ 2〜3 親 + 子、地域、駅 50〜100、掲載者 5〜10、グループ 1〜2、master 1 + owner 2）
- [ ] **PORTAL-5**: 静的 HTML/CSS を新規作成（ポータルデザイン: TOP・検索結果・掲載者・グループ）
- [ ] **PORTAL-6**: Next.js ページに変換（layout, TOP, /{category}, /listing/{id}, /group/{slug}, /login, /admin, /dashboard）
- [ ] **PORTAL-7**: ZeroCodeWrapper（CSR ラッパー: `dynamic(() => ..., { ssr: false })`）作成
- [ ] **PORTAL-8**: ブラウザで確認 → パーツ化する箇所を決定
- [ ] **PORTAL-9**: パーツ（テンプレート記法）に変換
- [ ] **PORTAL-10**: API Routes 実装（GET /api/data, POST /api/save + 権限チェック）
- [ ] **PORTAL-11**: ログイン画面実装
- [ ] **PORTAL-12**: 公開向け対応（SEO、エラーページ、セキュリティ、パフォーマンス）
- [ ] **PORTAL-13**: 動作確認（公開ページ → ログイン → 編集 → 保存 → 権限チェック）
- [ ] **PORTAL-14**: `README.md` 作成

### 全体

- [ ] **ALL-1**: `examples/README.md` 作成（3事例の概要・比較表・選び方）
- [ ] **ALL-2**: デモサイト（index.html）に事例紹介セクション追加（スクリーンショット + 説明）
- [ ] **ALL-3**: ルートの `README.md` の Examples セクションを更新
- [ ] **ALL-4**: `.gitignore` 更新（store.json, store.sqlite, .env, vendor/, node_modules/ 等）

---

**最終更新日**: 2026年3月
