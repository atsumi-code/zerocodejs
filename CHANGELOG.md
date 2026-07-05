# Changelog

このプロジェクトの主な変更を記録します。形式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に基づきます。

> **注意**: ベータ期間中は破壊的変更が予告なく入ることがあります。

## [未リリース]

### 追加

- パーツ管理タブのE2Eスモークテスト（タブ切替・一覧・編集モーダル・カテゴリ情報モーダル・Esc での多段クローズ）
- **モーダルのキーボードアクセシビリティ**: Esc で閉じる（重なったモーダルは最前面から・IME 変換取消は無視・Monaco 内は除外）、Tab のフォーカストラップ、開閉時のフォーカス移動/復元（`useModalA11y`）。保存確認ダイアログ・画像選択/編集・パーツ管理の各モーダルに適用

### 変更

- `PartsManagerPanel.vue` の独立モーダル4つ（拡大プレビュー / CSS警告 / カテゴリ情報 / テンプレート記法ヘルプ）を子コンポーネントに分割（1,538行 → 1,321行。挙動は不変）

## [1.0.1-beta.22] - 2026-07-06

### 追加

- バックエンドデータ参照のデフォルト値記法 `{@fieldName:defaultValue}`（データ未取得・パス不存在・null/undefined/空文字のときフォールバック）
- 専用画像のページスコープ（Phase 1）: `ImageData` の `scope` / `pageId`、`page-id` 属性、検証用 `test-cms-scope.html`
- 並べ替えパネルの D&D（SortableJS）と構造リスト、ミニマップ locate UX（ZC-5）
- 削除パネルに「削除後に次のパーツを選ぶ」オプション
- 画像選択モーダルに「全て」タブと常時追加ボタン
- 設定を初期値に戻す UI
- `sanitizeUrl` のテストを追加
- E2E テスト（Playwright）を導入: `zcode-cms` の「追加 → 編集 → 並べ替え → 保存イベント発火」スモークテストと CI の `e2e` ジョブ（`npm run test:e2e`）
- **軽量 `zerocodejs/cms` サブパスを追加**: `<zcode-cms>` のみを含むエントリ（初期ロード 圧縮後約100KB、フルバンドル比 約6割減）
- size-limit によるバンドルサイズの CI 監視（`npm run size`）

### 変更

- **テンプレートDSL処理系をパーサー方式に再設計**（内部リファクタリング、公開API・出力は不変）: フィールド記法のパースを `field-syntax.ts` の単一トークナイザに一元化し、`field-extractor` / `template-processor` の正規表現分岐複製（約30ブロック）を解消。キャラクタリゼーションテスト91件で出力の同一性を検証
- **ES ビルドをコード分割対応に変更**: Tiptap（リッチテキストエディタ）は初回利用時の遅延ロードに（約115KB）。UMD は従来どおり単一ファイル（CDN 互換維持、`vite.umd.config.ts`）
- **`sanitizeUrl` のセキュリティ強化**:
  - タブ・改行等の制御文字によるスキーム偽装（例: `java\tscript:`）を拒否
  - data URL は `href` / `action`（遷移先）ではラスター画像のみ許可し、SVG の data URL を拒否。`img` の `src` / `poster`（埋め込み先）では SVG も引き続き許可
  - シグネチャに `context: 'navigation' | 'embed'` 引数を追加（省略時は安全側の `navigation`）
- テンプレート処理の URL サニタイズ対象属性に `formaction` / `poster` を追加
- **rich フィールドを URL 属性（href 等）に展開する際も `sanitizeUrl` を通すよう修正**（従来はエスケープのみで `javascript:` スキームが素通しだった）
- UI 表記を「特別」から「専用」に統一
- 右クリックメニュー・パネルオプション UI を改善
- 画像選択モーダルのグリッドレイアウト・プレビュー・並べ替え表示を改善
- サイドパネルヘッダーの高さを統一

### 修正

- 表示モードからのモード切替を修正
- type-check エラーを修正

## [1.0.1-beta.21] - 2026-03-30

### 修正

- SSR: `getDOMParser` の分岐順と jsdom キャッシュを改善、`z-for` の document 依存を除去

## [1.0.1-beta.20] - 2026-03-29

### 追加

- `package.json` の exports に `./ssr` サブパスを追加（`import { renderToHtml } from 'zerocodejs/ssr'`）

### 変更

- フォーム系 UI のリセット CSS 耐性を `zcode-cms` に追加

## [1.0.1-beta.19] - 2026-03-29

### 変更

- `zcode-studio` を `zcode-editor` 同型シェルに再構成（ページ管理は CMS 同等、パーツ / 画像 / データビューアは専用系のみ）

## [1.0.1-beta.18] - 2026-03-22

### 追加

- SSR 用に CSS を出力する `renderCssToHtml` を追加
- Husky・lint-staged（pre-commit で ESLint / Prettier を実行）を導入

## [1.0.1-beta.17] - 2026-03-20

### 追加

- 制作会社向け `<zcode-studio>` コンポーネント（`save-request` の `source: 'studio'`）
- パーツテンプレート用サニタイズ関数 `sanitizePartTemplate`（npm から export、サーバーとルール共有可能）
- パーツ単位のアウトライン位置オプション（ヘッダーアイコン＋ポップオーバー）

### 変更

- 専用パーツ管理を `zcode-cms` / `zcode-editor` から分離し、`zcode-studio` に一元化

## 1.0.1-beta.16 以前（2026-01〜2026-02）

本ファイル導入前のため個別記録がありません。主な内容: 初回公開、i18n（日英 UI）、バリデーション記法、タグの動的変更（`z-tag`）、バックエンドデータ参照（`{@...}` / `z-for`）、選択肢記法の `ラベル=値` 対応、スマホ対応、パーツ管理のプレビュー連動・画像 ID 参照パネルなど。詳細は Git 履歴（`git log v1.0.1-beta.16` および各タグ）を参照してください。

[未リリース]: https://github.com/atsumi-code/zerocodejs/compare/v1.0.1-beta.22...HEAD
[1.0.1-beta.22]: https://github.com/atsumi-code/zerocodejs/compare/v1.0.1-beta.21...v1.0.1-beta.22
[1.0.1-beta.21]: https://github.com/atsumi-code/zerocodejs/compare/v1.0.1-beta.20...v1.0.1-beta.21
[1.0.1-beta.20]: https://github.com/atsumi-code/zerocodejs/compare/v1.0.1-beta.19...v1.0.1-beta.20
[1.0.1-beta.19]: https://github.com/atsumi-code/zerocodejs/compare/v1.0.1-beta.18...v1.0.1-beta.19
[1.0.1-beta.18]: https://github.com/atsumi-code/zerocodejs/compare/v1.0.1-beta.17...v1.0.1-beta.18
[1.0.1-beta.17]: https://github.com/atsumi-code/zerocodejs/compare/v1.0.1-beta.16...v1.0.1-beta.17
