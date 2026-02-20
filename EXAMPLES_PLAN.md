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

| 事例 | 参考 | セクション構成の参考 |
|------|------|---------------------|
| LP | tp_professionals1_red | ヒーロー、取扱分野、選ばれる理由、流れ、料金、お客様の声、FAQ |
| コーポレート | tp_biz62_red_photo | ヒーロー（スライド）、ご案内カード、お知らせ、会社概要 |
| ポータル | tp_portal1_pink | カテゴリ検索、一覧ページ、サイドバー、お知らせ |

---

## 3事例の構成

| | LP | コーポレート | ポータル |
|---|---|---|---|
| **フロント** | 静的 HTML + CDN | Laravel Blade | Next.js |
| **バックエンド** | Node.js + Express | Laravel（PHP） | Next.js API Routes |
| **DB** | JSON ファイル | MySQL（Docker） | Supabase（PostgreSQL） |
| **認証** | なし | なし | Supabase Auth（master / owner） |
| **ZeroCode コンポーネント** | `<zcode-editor>` | `<zcode-editor>` + `<zcode-cms>` | `<zcode-editor>` + `<zcode-cms>` |
| **起動方法** | `npm start` | `docker compose up` | Supabase 登録 → `npm run dev` |
| **バリデーション** | 最小限（型チェック + target 許可リスト） | 標準（Laravel FormRequest） | 標準 + 権限チェック |

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
├── portal/                          ← 事例3: ポータル
│   ├── README.md
│   ├── package.json                 (next, react, zerocodejs, @supabase/supabase-js)
│   ├── next.config.js
│   ├── .env.example                 (SUPABASE_URL, SUPABASE_ANON_KEY)
│   ├── supabase/
│   │   └── migrations/
│   │       └── 001_init.sql         (テーブル定義 + RLS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           (共通レイアウト)
│   │   │   ├── page.tsx             (公開トップ: 店舗一覧)
│   │   │   ├── shop/[shopId]/
│   │   │   │   └── page.tsx         (公開: 店舗ページ SSR)
│   │   │   ├── login/
│   │   │   │   └── page.tsx         (ログイン画面)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx         (マスター管理: zcode-editor)
│   │   │   │   └── shop/[shopId]/
│   │   │   │       └── page.tsx     (マスター: 店舗別編集)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         (オーナー: 自店舗編集 zcode-cms)
│   │   │   └── api/
│   │   │       ├── data/route.ts    (GET: データ取得)
│   │   │       └── save/route.ts    (POST: データ保存)
│   │   ├── lib/
│   │   │   └── supabase.ts          (Supabase クライアント)
│   │   └── components/
│   │       └── ZeroCodeWrapper.tsx   (Web Components の CSR ラッパー)
│   └── public/
│       ├── css/style.css            (ポータル用デザイン)
│       └── images/
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

- 複数ページの企業サイト
- Laravel + MySQL + Docker で「実務標準の構成」を示す
- Blade テンプレートの中に ZeroCode コンポーネントを埋め込む

### ページ構成（参考: tp_biz62_red_photo）

- **トップページ（/）**: ヒーロー、ご案内カード、お知らせ一覧、会社概要サマリー
- **管理画面（/admin）**: `<zcode-editor>` で全ページを管理
- **CMS 画面（/cms）**: `<zcode-cms>` でページ編集のみ

### DB 設計（MySQL）

```sql
-- CSS
CREATE TABLE css (
  category VARCHAR(20) PRIMARY KEY,  -- common | individual | special
  content  LONGTEXT
);

-- パーツのタイプ
CREATE TABLE types (
  id          VARCHAR(100) PRIMARY KEY,
  category    VARCHAR(20),  -- common | individual | special
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
  id          VARCHAR(100) PRIMARY KEY,
  category    VARCHAR(20),  -- common | individual | special
  name        VARCHAR(200),
  url         TEXT,
  mime_type   VARCHAR(50),
  needs_upload TINYINT DEFAULT 0
);

-- ページ
CREATE TABLE pages (
  id   VARCHAR(100) PRIMARY KEY,  -- 'default' など
  data JSON
);
```

### バックエンド仕様

- **GET /api/data** — 全テーブルから読み込み、ZeroCodeData 形式で返す
- **POST /api/save** — `{ target, source, data }` を受け取り、該当テーブルを更新
- **バリデーション（Laravel FormRequest）**:
  - target の許可リスト
  - source と target の組み合わせ検証（CMS からパーツ保存を拒否）
  - data の構造検証（配列/文字列の型、必須フィールド）
  - サイズ制限
  - テンプレート（body）のサニタイズ（`<script>` タグ拒否）
- **CSRF 保護** — Blade の `@csrf` + `X-CSRF-TOKEN` ヘッダー

### 実装の流れ

1. Docker 環境（PHP + MySQL + Nginx）を構築
2. Laravel プロジェクトを初期化
3. マイグレーション + シーダーを作成
4. 静的 HTML/CSS を新規作成（コーポレートデザイン）
5. Blade テンプレートに変換（admin.blade.php, cms.blade.php, page.blade.php）
6. ブラウザで確認 → パーツ化する箇所を決定
7. パーツ（テンプレート記法）に変換
8. API コントローラー + バリデーション（SaveRequest）を実装
9. zerocode-api.js（CSRF 対応）を実装
10. README.md を作成

---

## 事例3: ポータル

### 概要

- 検索・一覧型のポータルサイト
- Next.js + Supabase で「モダンスタック + 認証」を示す
- 店舗単位で編集可能。マスター / 店舗オーナーの権限分け

### ページ構成（参考: tp_portal1_pink）

- **公開ページ**:
  - `/` — トップページ（店舗一覧、カテゴリ検索）
  - `/shop/[shopId]` — 店舗ページ（SSR）
- **認証**:
  - `/login` — ログイン画面
- **マスター管理**:
  - `/admin` — 全店舗管理（`<zcode-editor>`）
  - `/admin/shop/[shopId]` — 特定店舗の編集
- **店舗オーナー**:
  - `/dashboard` — 自店舗の編集（`<zcode-cms>`）

### 認証・権限

| ロール | コンポーネント | できること |
|--------|--------------|-----------|
| master | `<zcode-editor>` | 全店舗の編集、パーツ管理、画像管理、ユーザー管理 |
| owner | `<zcode-cms>` | 自店舗のページ編集、自店舗の画像管理 |

- Supabase Auth（メール + パスワード）
- Row Level Security（RLS）で DB レベルのアクセス制御
- API Routes で権限チェック

### DB 設計（Supabase / PostgreSQL）

```sql
-- ユーザープロフィール
CREATE TABLE profiles (
  id       UUID PRIMARY KEY REFERENCES auth.users(id),
  role     TEXT NOT NULL CHECK (role IN ('master', 'owner')),
  shop_id  UUID REFERENCES shops(id),
  name     TEXT
);

-- 店舗
CREATE TABLE shops (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL,
  slug  TEXT UNIQUE NOT NULL
);

-- ページ（店舗ごと）
CREATE TABLE pages (
  shop_id    UUID REFERENCES shops(id) ON DELETE CASCADE,
  data       JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (shop_id)
);

-- CSS（店舗ごと）
CREATE TABLE css (
  shop_id   UUID REFERENCES shops(id) ON DELETE CASCADE,
  category  TEXT NOT NULL,
  content   TEXT DEFAULT '',
  PRIMARY KEY (shop_id, category)
);

-- パーツのタイプ（全店舗共通）
CREATE TABLE types (
  id          TEXT PRIMARY KEY,
  category    TEXT NOT NULL,
  type        TEXT NOT NULL,
  description TEXT,
  sort_order  INT DEFAULT 0
);

-- パーツ（全店舗共通）
CREATE TABLE parts (
  id          TEXT PRIMARY KEY,
  type_id     TEXT REFERENCES types(id) ON DELETE CASCADE,
  title       TEXT,
  description TEXT,
  body        TEXT,
  slot_only   BOOLEAN DEFAULT false,
  slots       JSONB,
  sort_order  INT DEFAULT 0
);

-- 画像（店舗ごと）
CREATE TABLE images (
  id          TEXT NOT NULL,
  shop_id     UUID REFERENCES shops(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  name        TEXT,
  url         TEXT,
  mime_type   TEXT,
  needs_upload BOOLEAN DEFAULT false,
  PRIMARY KEY (id, shop_id)
);

-- RLS ポリシー
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_all" ON pages
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'master'
  );

CREATE POLICY "owner_own_shop" ON pages
  FOR ALL USING (
    shop_id = (SELECT shop_id FROM profiles WHERE id = auth.uid())
  );
```

### バックエンド仕様

- **GET /api/data?shopId=xxx** — 指定店舗のデータを返す（権限チェック付き）
- **POST /api/save** — `{ shopId, target, source, data }` を受け取り保存（権限チェック付き）
- **バリデーション**:
  - 認証チェック（未ログインは 401）
  - 権限チェック（owner は自店舗のみ、パーツ変更不可）
  - target の許可リスト
  - データ構造検証
  - テンプレートのサニタイズ

### 実装の流れ

1. Next.js プロジェクトを初期化
2. Supabase プロジェクトを作成（無料枠）
3. マイグレーション（テーブル + RLS）を作成
4. 初期データ（店舗 2〜3、デモユーザー）を投入
5. 静的 HTML/CSS を新規作成（ポータルデザイン）
6. Next.js ページに変換（layout, page, admin, dashboard）
7. ZeroCodeWrapper（CSR ラッパー: `dynamic(() => ..., { ssr: false })`）を作成
8. ブラウザで確認 → パーツ化する箇所を決定
9. パーツ（テンプレート記法）に変換
10. API Routes（data, save）を実装（権限チェック付き）
11. ログイン画面を実装
12. README.md を作成

---

## デモサイトへの掲載

### 方針: 方法 B（スクリーンショット + 説明）

- GitHub Pages のデモサイトに「事例紹介」セクションを追加
- 各事例のスクリーンショット、技術スタック、構成図を掲載
- 「ローカルで試す」ボタンで GitHub の各事例 README へ誘導
- 実際のバックエンドは動かさない（静的ページとして紹介のみ）

### 実装

- `index.html`（デモサイトトップ）に事例セクションを追加
- 各事例のスクリーンショット画像を `public/images/examples/` に配置

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

| 事例 | レベル | 内容 |
|------|--------|------|
| LP | 最小限 | target 許可リスト + 型チェック + サイズ制限 |
| コーポレート | 標準 | 上記 + source 検証 + データ構造検証 + テンプレートサニタイズ + CSRF |
| ポータル | 標準 + 権限 | 上記 + 認証チェック + 権限チェック（master / owner） |

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
- [ ] **CORP-4**: マイグレーション作成（css, types, parts, images, pages テーブル）
- [ ] **CORP-5**: シーダー作成（初期データ投入）
- [ ] **CORP-6**: 静的 HTML/CSS を新規作成（コーポレートデザイン）
- [ ] **CORP-7**: Blade テンプレートに変換（admin, cms, page）
- [ ] **CORP-8**: ブラウザで確認 → パーツ化する箇所を決定
- [ ] **CORP-9**: パーツ（テンプレート記法）に変換
- [ ] **CORP-10**: API コントローラー + SaveRequest バリデーション実装
- [ ] **CORP-11**: `js/zerocode-api.js` 実装（CSRF 対応）
- [ ] **CORP-12**: 動作確認（Docker 起動 → 編集 → 保存 → DB 反映）
- [ ] **CORP-13**: `README.md` 作成

### 事例3: ポータル

- [ ] **PORTAL-1**: `examples/portal/` ディレクトリ作成
- [ ] **PORTAL-2**: Next.js プロジェクト初期化
- [ ] **PORTAL-3**: Supabase プロジェクト作成 + マイグレーション（テーブル + RLS）
- [ ] **PORTAL-4**: 初期データ投入（店舗 2〜3、デモユーザー）
- [ ] **PORTAL-5**: 静的 HTML/CSS を新規作成（ポータルデザイン）
- [ ] **PORTAL-6**: Next.js ページに変換（layout, page, shop, admin, dashboard, login）
- [ ] **PORTAL-7**: ZeroCodeWrapper（CSR ラッパー）作成
- [ ] **PORTAL-8**: ブラウザで確認 → パーツ化する箇所を決定
- [ ] **PORTAL-9**: パーツ（テンプレート記法）に変換
- [ ] **PORTAL-10**: API Routes 実装（data, save + 権限チェック）
- [ ] **PORTAL-11**: ログイン画面実装
- [ ] **PORTAL-12**: 動作確認（ログイン → 編集 → 保存 → 権限チェック）
- [ ] **PORTAL-13**: `README.md` 作成

### 全体

- [ ] **ALL-1**: `examples/README.md` 作成（3事例の概要・比較表・選び方）
- [ ] **ALL-2**: デモサイト（index.html）に事例紹介セクション追加（スクリーンショット + 説明）
- [ ] **ALL-3**: ルートの `README.md` の Examples セクションを更新
- [ ] **ALL-4**: `.gitignore` 更新（store.json, store.sqlite, .env, vendor/, node_modules/ 等）

---

**最終更新日**: 2026年2月
