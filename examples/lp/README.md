# LP Example（Express + JSON）

ZeroCode.js で LP を編集・公開する事例です。編集用の管理画面と、公開用の LP 表示を分け、**SSR のみ**で公開し、**ディレクトリ別の複数ページ**に対応しています。

## 起動方法

1. リポジトリルートで ZeroCode をビルド: `npm run build`
2. このディレクトリでサーバー起動: `npm run dev`（開発用・公開ページに dev 用 UI 表示）または `npm start`（本番想定・NODE_ENV=production、dev 用 UI 非表示）
3. ブラウザで `http://localhost:3000` を開く

## ページ構成

| URL | 用途 |
|-----|------|
| `/` または `/index.html` | **公開LP（トップ）** — デフォルトページを SSR 表示 |
| `/lp/:name/` | **公開LP（ディレクトリ別）** — `data/pages/:name/page.json` を SSR 表示（`data/common.json` とマージ） |
| `/edit` または `/edit/:page` | **管理画面** — パスでページを指定して編集・保存（`zcode-editor`）。例: `/edit`（トップ）, `/edit/campaign`, `/edit/feature` |

- 公開LPは **SSR のみ**（クライアント用の静的 index.html はありません）。
- 管理画面は **URL パスでページを分離**（`/edit`＝トップ、`/edit/campaign`＝キャンペーン、`/edit/feature`＝特集）。ブックマーク・共有・ブラウザ戻るがそのまま使えます。ヘッダーのセレクトでページを切り替えると URL が変わり、**ページの追加**は `data/pages/<名前>/page.json` を用意するだけで一覧に反映されます。「公開ページを表示」は選択中のページの URL へリンクします。
- **共通（最小限）**: `data/common.json` には CTA パーツと共通画像のみ。各ページのデザイン・パーツはページ別に定義。`data/default-store.json` は初期化用シード（common や default の page.json が無いときに参照）です。
- **ページ固有**: `data/pages/:name/page.json` に `page`（コンポーネント配列）と **`parts.individual`**（そのページ用のヒーロー・セクション・カード等）を定義。HTML 構造もページごとに変更可能。
- **CSS**: `public/css/style.css` は **共通の base のみ**（変数・リセット・`.container`・ボタン・dev 用ヘッダー/フッター）。**ページ用のコンポーネント（hero, section, reasons, faq, cta 等）は各ページの CSS に完全に定義**。`public/css/pages/default.css` / `campaign.css` / `feature.css` はそれぞれそのページ用のスタイルのみで完結し、style.css のコンポーネントには依存しない。公開・編集ともに base + 該当ページの 1 本を読み込む。
- 同梱サンプル: `default`（トップ）、`campaign`（キャンペーンLP）、`feature`（特集LP）。
- **処理の流れ**: 公開・編集・保存の詳細は [FLOW.md](./FLOW.md) を参照。

## API

- `GET /api/pages` — ページ名一覧（`['default', 'campaign', 'feature', ...]`。default / campaign / feature を先頭順で返し、それ以外はアルファベット順）
- `GET /api/data?page=default` — 指定ページの store 取得
- `POST /api/save` — body に `{ target, data, page? }`。`page` 省略時は default
- `POST /api/reset` — body に `{ page? }` で該当ページを初期化

## 本番運用時の注意

- **管理画面の保護**: 環境変数 `EDIT_USER` と `EDIT_PASSWORD` を**両方**設定すると、管理画面（`/edit`, `/edit/:page`, `/edit.html`）および API（`/api/pages`, `/api/data`, `/api/save`, `/api/reset`）が **Basic 認証**で保護されます。未設定の場合は認証なし（開発用）です。本番では必ず両方を設定してください。
  - 例: `EDIT_USER=admin EDIT_PASSWORD=your-secret node server.js`
  - 公開ページ（`/`, `/lp/:name/`）は認証の影響を受けません。
  - 本番では HTTPS の利用を推奨します。
- **公開ページの dev 用 UI**: `NODE_ENV=production` で起動すると、公開ページ（`/`, `/lp/:name/`）から **dev-header**（「編集画面へ」）と **dev-footer**（「管理画面で編集」）および dev.css が出力されません。開発時は `NODE_ENV` を未設定または `development` にすると表示されます。
