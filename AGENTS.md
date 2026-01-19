# ZeroCode.js - エージェント向けガイドライン

> **このファイルの目的**: AIエージェントがZeroCode.jsを効率的に開発するためのガイドラインです。実装方針、データ構造、テンプレート記法、ファイル構成などの情報を提供します。

## 📑 目次

- [📚 ドキュメントの読み方ガイド](#-ドキュメントの読み方ガイド)
  - [開発開始時の推奨フロー](#開発開始時の推奨フロー)
  - [各mdファイルの役割](#各mdファイルの役割)
  - [クイックリファレンス](#クイックリファレンス)
- [開発状況](#開発状況)
- [コメントアウトに関する方針](#コメントアウトに関する方針)
- [コードスタイル](#コードスタイル)
- [HTMLタグの使用方針](#htmlタグの使用方針)
- [データ構造](#データ構造)
- [テンプレート記法](#テンプレート記法)
- [コンポーネント初期化](#コンポーネント初期化)
- [イベント](#イベント)
- [ファイル構成](#ファイル構成)
- [実装済み機能](#実装済み機能)
- [開発開始時のチェックリスト](#開発開始時のチェックリスト)
- [実装時の注意事項](#実装時の注意事項)
- [実装パターン集](#実装パターン集)
- [トラブルシューティング](#トラブルシューティング)
- [参考リンク](#参考リンク)

## 📚 ドキュメントの読み方ガイド

### 開発開始時の推奨フロー

1. **タスクの理解**
   - `TODO.md`でタスクの詳細を確認
   - 実装済み機能の一覧を確認（`AGENTS.md`の「実装済み機能」セクション）

2. **実装前の確認**
   - `AGENTS.md`の「実装時の注意事項」を確認
   - 関連するテンプレート記法を確認（`AGENTS.md`の「テンプレート記法」セクション）
   - データ構造を確認（`AGENTS.md`の「データ構造」セクション）

3. **実装中の参照**
   - ファイル構成を確認（`AGENTS.md`の「ファイル構成」セクション）
   - 参考リンクから実装例を確認

4. **実装後の更新**
   - `TODO.md`の該当タスクを完了に更新
   - `AGENTS.md`の「実装済み機能」に追加（必要に応じて）
   - `TECHNICAL_SPECIFICATION.md`を更新（API変更がある場合）

### 各mdファイルの役割

| ファイル                       | 目的                               | いつ読むか                                                                 |
| ------------------------------ | ---------------------------------- | -------------------------------------------------------------------------- |
| **AGENTS.md**                  | AI開発向けの実装ガイドライン       | **常に最初に読む**。実装方針、データ構造、テンプレート記法、注意事項を確認 |
| **TODO.md**                    | 実装タスクの一覧と進捗             | タスクの詳細を確認する時、実装完了時に更新                                 |
| **TECHNICAL_SPECIFICATION.md** | 技術仕様書（API詳細）              | APIの詳細仕様を確認する時、外部向けドキュメントとして参照                  |
| **README.md**                  | プロジェクト概要とクイックスタート | プロジェクトの全体像を把握する時                                           |
| **I18N_SPECIFICATION.md**      | 多言語対応の仕様書                 | i18n機能を実装する時のみ                                                   |

### クイックリファレンス

#### よく使う情報へのリンク

- **テンプレート記法一覧**: [AGENTS.md - テンプレート記法](#テンプレート記法)
- **データ構造**: [AGENTS.md - データ構造](#データ構造)
- **イベント仕様**: [AGENTS.md - イベント](#イベント)
- **ファイル構成**: [AGENTS.md - ファイル構成](#ファイル構成)
- **実装済み機能**: [AGENTS.md - 実装済み機能](#実装済み機能)
- **実装時の注意事項**: [AGENTS.md - 実装時の注意事項](#実装時の注意事項)

#### よくある質問（FAQ）

**Q: 新しいテンプレート記法を追加するには？**

- A: `src/core/utils/template-processor.ts`の`extractFieldsFromTemplate`と`processTemplateWithDOM`を修正。`AGENTS.md`の「テンプレート記法の実装」セクションを参照。

**Q: 新しいイベントを追加するには？**

- A: `src/components/ZeroCodeCMS.vue`または`ZeroCodeEditor.vue`で`dispatchEvent`を呼び出し。`AGENTS.md`の「イベント処理」セクションを参照。

**Q: 新しいコンポーザブルを作成するには？**

- A: `src/features/`配下に適切なディレクトリを作成。`AGENTS.md`の「ファイル構成」セクションを参照。

**Q: データ保存の仕様を確認したい**

- A: `AGENTS.md`の「データ保存の仕様」セクションを参照。`save-request`イベントのみが保存ポイント。

**Q: テンプレート記法の処理順序がわからない**

- A: `AGENTS.md`の「テンプレート記法の処理順序」セクションを参照。`z-if` → `z-tag` → `z-empty` → `z-for` → `z-slot`の順で処理。

**Q: コンポーネントの初期化タイミングは？**

- A: データ読み込み時（`page`属性が設定された時点）に自動実行。`AGENTS.md`の「コンポーネント初期化」セクションを参照。

**Q: オプショナルフィールドと通常フィールドの違いは？**

- A: オプショナルフィールド（`{$field?:default}`）は初期化されず`undefined`のまま。通常フィールドはデフォルト値で初期化。`AGENTS.md`の「コンポーネント初期化」セクションを参照。

## 開発状況

**現在はリリース前の開発段階です。**

- 後方互換性を考慮する必要はありません
- 既存のAPIやインターフェースを変更しても問題ありません
- 破壊的変更（Breaking Changes）を気にせずに実装できます
- コードの改善やリファクタリングを優先してください

## コメントアウトに関する方針

### 実装時の説明コメントは不要

実装時に更新内容の説明をコメントアウトとして記載する必要はありません。

**推奨しない例:**

```typescript
// グループ名を追加
groupName: field.groupName,

// グループ付きパターンを先に処理
const textWithGroupRegex = new RegExp(...);
```

**推奨する例:**

```typescript
groupName: field.groupName,

const textWithGroupRegex = new RegExp(...);
```

### コメントを記載する場合

以下の場合のみ、コメントを記載してください：

1. **複雑なロジックの説明**: コードだけでは理解が困難な場合
2. **TODO/FIXME**: 将来の改善点や既知の問題
3. **外部依存関係の説明**: 外部ライブラリやAPIの仕様に関する説明
4. **型定義の説明**: 複雑な型定義やインターフェースの説明

**例:**

```typescript
// TODO: パフォーマンス最適化が必要（大量データ時に遅延が発生する可能性）
// FIXME: エッジケースでnull参照エラーが発生する可能性あり

/**
 * テンプレートからフィールド情報を抽出する
 * @param template - HTMLテンプレート文字列
 * @returns 抽出されたフィールド情報の配列
 */
```

## コードスタイル

- 自己説明的なコードを心がける
- 変数名や関数名で意図を明確にする
- 必要最小限のコメントのみ記載

## HTMLタグの使用方針

ZeroCodeのCSSが呼び出し側のCSS（リセットCSSやデフォルトCSS）に影響を与えないよう、以下の方針に従ってください。

### 基本方針

- **セマンティックなHTMLタグ（h1-h6, p, ul, ol, li, strong, em, s, code, table, th, td, tr, tbodyなど）は極力使用しない**
- **代わりに`div`や`span`を使用し、適切なクラス名を付与する**
- **アクセシビリティのため、見出しとして意味がある箇所には`role="heading"`と`aria-level`を設定する**

### 具体的な変更ルール

#### 1. 見出しタグ（h1-h6）→ div

見出しとして意味がある箇所のみ`role="heading"`と`aria-level`を設定します。

**変更前:**

```vue
<h3 class="zcode-panel-header-title">編集中: {{ editingComponent.type }}</h3>
```

**変更後:**

```vue
<div class="zcode-panel-header-title" role="heading" aria-level="3">
  編集中: {{ editingComponent.type }}
</div>
```

#### 2. 段落タグ（p）→ div

`role`属性は不要です。

**変更前:**

```vue
<p class="zcode-edit-fields-text">ID: {{ editingComponent.id }}</p>
```

**変更後:**

```vue
<div class="zcode-edit-fields-text">ID: {{ editingComponent.id }}</div>
```

#### 3. リストタグ（ul, ol, li）→ div構造

`role="list"`と`role="listitem"`を設定します。

**変更前:**

```vue
<ul>
  <li>項目1</li>
  <li>項目2</li>
</ul>
```

**変更後:**

```vue
<div role="list" class="zcode-help-section-list">
  <div role="listitem" class="zcode-help-section-item">項目1</div>
  <div role="listitem" class="zcode-help-section-item">項目2</div>
</div>
```

### アクセシビリティについて

- **見出しとして意味がある箇所のみ**`role="heading"`と`aria-level`を設定
- 単なるテキスト表示の場合は`role`属性は不要
- タブ操作程度でCMSとしての機能ができれば十分（スクリーンリーダー対応は必須ではない）

### 対象となるタグ

以下のタグは原則として使用を避け、`div`や`span`に置き換えます：

- `h1`, `h2`, `h3`, `h4`, `h5`, `h6` → `div`（見出しとして意味がある場合のみ`role="heading"`と`aria-level`を設定）
- `p` → `div`
- `ul`, `ol`, `li` → `div`構造（`role="list"`と`role="listitem"`を設定）
- `strong`, `em`, `s` → `span`（必要に応じて）
- `code` → `span`（必要に応じて）
- `table`, `th`, `td`, `tr`, `tbody` → `div`構造（必要に応じて）

### 例外

- `button`タグは機能維持のため、CSSで防御する方針
- フォーム要素（`input`, `textarea`, `select`など）は機能上必要なため使用可能

## データ構造

### ZeroCodeData

```typescript
interface ZeroCodeData {
  page: ComponentData[];
  css: {
    common?: string; // 共通パーツ用CSS
    individual?: string; // 個別パーツ用CSS
    special?: string; // 特別パーツ用CSS
  };
  parts: {
    common: TypeData[];
    individual: TypeData[];
    special: TypeData[];
  };
  images: {
    common: ImageData[];
    individual: ImageData[];
    special: ImageData[];
  };
  backendData?: Record<string, any>; // バックエンドデータ
}
```

### ComponentData

```typescript
interface ComponentData {
  id: string;
  part_id: string; // パーツID（タイトル変更時も紐付けが維持される）
  [key: string]: any; // フィールドの値（テンプレート記法で定義されたフィールド）
  slots?: Record<string, ComponentData[] | SlotConfig>; // スロットの子コンポーネント
}
```

### SlotConfig

```typescript
interface SlotConfig {
  allowedParts?: string[]; // 許可されるパーツID
  children?: ComponentData[]; // 子コンポーネント（既存の形式との互換性）
}
```

### TypeData

```typescript
interface TypeData {
  id: string; // タイプID（タイプ変更時も紐付けが維持される）
  type: string;
  description: string;
  parts: PartData[];
}
```

### PartData

```typescript
interface PartData {
  id: string; // パーツID（タイトル変更時も紐付けが維持される）
  title: string;
  description: string;
  body: string; // パーツのテンプレート（HTML文字列）
  slots?: Record<string, { allowedParts?: string[] }>; // スロット設定
  slotOnly?: boolean; // スロット専用パーツ
}
```

### ImageData

```typescript
interface ImageData {
  id: string;
  name: string;
  url: string;
  mimeType?: string; // MIMEタイプ（base64画像の場合）
  needsUpload?: boolean; // アップロードが必要かどうか
}
```

## テンプレート記法

### 実装済みのテンプレート記法

#### フィールド記法

- **テキストフィールド**: `{$fieldName:defaultValue}`
- **テキストエリア**: `{$fieldName:defaultValue:textarea}`
- **リッチテキスト**: `{$fieldName:defaultValue:rich}`
- **画像フィールド**: `{$fieldName:defaultValue:image}`
- **オプショナルフィールド**: `{$fieldName?:defaultValue}`（空入力時は`undefined`）
- **グループ化**: `{$fieldName.groupName:defaultValue}`

#### 選択肢記法

- **ラジオボタン（単一選択）**: `($fieldName:option1|option2|option3)`
- **チェックボックス（複数選択）**: `($fieldName:option1,option2,option3)`
- **セレクトボックス（単一選択）**: `($fieldName@:option1|option2|option3)`
- **セレクトボックス（複数選択）**: `($fieldName@:option1,option2,option3)`

#### バリデーション記法

- **必須**: `{$fieldName:defaultValue:required}`
- **最大文字数**: `{$fieldName:defaultValue:max=100}`
- **読み取り専用**: `{$fieldName:defaultValue:readonly}`
- **無効化**: `{$fieldName:defaultValue:disabled}`
- **複数指定**: `{$fieldName:defaultValue:required:max=50}`

#### バックエンドデータ

- **基本参照**: `{@fieldName}`
- **ネスト参照**: `{@user.name}`
- **配列参照**: `{@items[0]}`, `{@items[0].name}`
- **配列のlength**: `{@items.length}`
- **URL内プレースホルダー**: `/shop/{shop_id}/products`

#### 条件分岐・制御

- **条件分岐**: `z-if="key"`（表示するかしないか。指定キーの真偽で表示/削除。fieldName に紐づく形ではない）
- **タグの動的変更**: `z-tag="$tagName:h1|h2|h3"`（テンプレートで書いたタグ名がデフォルト値）
- **空要素の削除**: `z-empty="$fieldName"`（**fieldName に紐づく**。フィールドが空の場合、親要素を削除）
- **ループ**: `z-for="item in {@items}"`（バックエンドデータの配列をループ）
- **スロット**: `z-slot="slotName"`（子コンポーネントを挿入する位置）

### テンプレート記法の処理順序

`processTemplateWithDOM`関数内での処理順序：

1. テキストノードの変数展開（バックエンドデータ、リッチテキスト、テキストフィールドなど）
2. 属性内の変数展開
3. `z-if`条件分岐処理（表示 on/off。条件が偽の場合は要素を削除、処理後に`z-if`属性を削除）
4. `z-tag`タグ名の動的変更処理（タグ名を変更し、`z-tag`属性は新しい要素にコピーしない）
5. `z-empty`条件分岐処理（**fieldName に紐づく**。フィールドが空の場合は要素を削除、処理後に`z-empty`属性を削除）
6. `z-for`ループ処理（バックエンドデータの配列をループ、処理後に`z-for`属性を削除）
7. `z-slot`処理（スロットに子コンポーネントを挿入、処理後に`z-slot`属性を削除）

## コンポーネント初期化

### 自動初期化の仕様

データ読み込み時（`page`属性が設定された時点）に、`initializeAllComponentFields`関数が自動的に実行されます。

**動作:**

- すべてのコンポーネント（スロット内も含む）に対して再帰的に処理
- テンプレートに定義されている通常フィールドで、コンポーネントデータに存在しない（`undefined`）場合、デフォルト値で初期化
- オプショナルフィールド（`{$field?:default}`）は初期化されず、`undefined`のまま
- スロット内の子コンポーネントも再帰的に処理

**デフォルト値:**

- テキスト/テキストエリア: テンプレートで指定されたデフォルト値、または空文字列
- リッチテキスト: デフォルト値がある場合は`<p>デフォルト値</p>`、ない場合は`<p></p>`
- 画像: テンプレートで指定されたデフォルト値、または空文字列
- ラジオボタン/セレクトボックス: 最初の選択肢
- チェックボックス/複数選択セレクト: 空配列`[]`
- ブール値: `true`
- タグ: テンプレートで書いたタグ名（選択肢に含まれていない場合は選択肢の最初の値）

**実装箇所:**

- `src/core/utils/component-initializer.ts`: `initializeAllComponentFields`関数
- `src/core/composables/useZeroCodeData.ts`: `loadDataFromProps`関数内で呼び出し

## イベント

### save-request

**発火タイミング**: 保存ボタンクリック時のみ

**イベント詳細:**

```typescript
{
  requestId: string; // リクエストID（save-resultイベントで使用）
  source: 'cms' | 'editor'; // 送信元
  targets: string[]; // 保存対象の配列（複数のターゲットが含まれる場合がある）
  timestamp: number; // タイムスタンプ
}
```

**targets配列の仕様:**

- **zcode-cms の編集モード**: `['page', 'images-common', 'images-individual']`（`images-special` は含まれない）
- **zcode-editor のページ管理タブ**: `['page', 'images-common', 'images-individual', 'images-special']` など、タブ・カテゴリに応じて `images-special` が加わる場合がある
- **パーツ管理（`primaryTarget: 'parts-common'` 等）**: `[primaryTarget, 'parts-*-css']`（カテゴリに応じたCSSターゲット）
- **画像管理**: `['images-common']` / `['images-individual']` / `['images-special']`
- **データビューア**: 選択中のタブとカテゴリに応じて決定

**注意:** `event.detail` に `data` は含まれない。受信側で `cms.getData()` を呼んで取得する。

**注意事項:**

- `change`イベントは削除済み（保存ボタン以外での自動保存は行わない）
- 画像追加時の自動保存は行わない
- CSSは編集モードの保存対象から除外（パーツ管理でのみ編集可能）

### save-result

**発火タイミング**: 保存処理完了時（成功・失敗問わず）

**イベント詳細:**

```typescript
{
  requestId: string; // save-requestのrequestIdと同じ値
  target: string; // 保存対象（'page', 'parts-common', 'parts-individual', 'parts-special', 'images-common', 'images-individual', 'images-special', 'parts-common-css', 'parts-individual-css', 'parts-special-css'）
  ok: boolean; // 保存成功かどうか
  errors: Array<{
    path?: string; // コンポーネントのパス（オプション）
    field?: string; // フィールド名
    message: string; // エラーメッセージ
    code?: string; // エラーコード（オプション）
  }>;
}
```

### zcode-dom-updated

**発火タイミング**: DOMが更新されたとき（コンポーネントの追加・削除・並べ替え、フィールドの編集など）

**用途**: 動的コンテンツ（アコーディオン、タブ、モーダルなど）の初期化

## ファイル構成

### 主要なコンポーネント

- `src/components/ZeroCodeCMS.vue`: ユーザー用管理画面
- `src/components/ZeroCodeEditor.vue`: エンジニア用管理画面（ZeroCodeCMS + パーツ管理・画像管理・データビューア）
- `src/components/ZeroCodePreview.vue`: プレビュー表示用コンポーネント

### コアコンポーザブル

- `src/core/composables/useZeroCodeData.ts`: データ管理（読み込み、取得、設定）
- `src/core/composables/useZeroCodeRenderer.ts`: レンダリング処理

### 機能別コンポーザブル

#### エディタ機能

- `src/features/editor/composables/useEditMode.ts`: 編集モード
- `src/features/editor/composables/useEditorMode.ts`: エディタモード（モード切り替え）
- `src/features/editor/composables/useClickHandlers.ts`: クリックハンドラー
- `src/features/editor/composables/useModeSwitcher.ts`: モード切り替え
- `src/features/editor/composables/useContextMenu.ts`: 右クリックメニュー
- `src/features/editor/composables/useOutlineManager.ts`: アウトライン管理（ホバー・選択状態の表示）

#### モード別機能

- `src/features/add/composables/useAddMode.ts`: 追加モード（追加パネル用）
- `src/features/delete/composables/useDeleteMode.ts`: 削除モード（削除パネル用）
- `src/features/reorder/composables/useReorderMode.ts`: 並べ替えモード（並べ替えパネル用）

#### その他機能

- `src/features/parent-selector/composables/useParentSelector.ts`: 親要素選択
- `src/features/parts-manager/composables/usePartsManager.ts`: パーツ管理
- `src/features/images-manager/composables/useImagesManager.ts`: 画像管理

### ユーティリティ関数

- `src/core/utils/template-processor.ts`: テンプレート処理（フィールド抽出、変数展開、条件分岐など）
- `src/core/utils/component-initializer.ts`: コンポーネント初期化（不足フィールドの自動初期化）
- `src/core/utils/storage.ts`: ローカルストレージ管理（ユーザー設定の保存・読み込み）
- `src/core/utils/dom-utils.ts`: DOM操作ユーティリティ
- `src/core/utils/sanitize.ts`: サニタイズ処理（リッチテキスト、URL、属性値）
- `src/core/utils/path-utils.ts`: パス操作ユーティリティ
- `src/core/utils/image-utils.ts`: 画像処理ユーティリティ
- `src/core/utils/css-manager.ts`: CSS管理
- `src/core/utils/validation.ts`: バリデーション処理

### レンダラー

- `src/core/renderer/renderer.ts`: レンダリング処理（HTML生成）

## 実装済み機能

### 完了済み機能

1. ✅ **ローカルストレージ設定保持**（2025年12月5日）
2. ✅ **ブラウザバック対応**（2025年12月5日）
3. ✅ **複数保存ポイント**（2025年12月5日）
4. ✅ **データビューアー改善**（2025年12月）
5. ✅ **編集モードのグループ化**（2025年12月）
6. ✅ **バックエンドデータの挿入**（2025年1月）
7. ✅ **バリデーションチェック&入力制御**（2025年1月）
8. ✅ **空入力制御**（2025年1月）
9. ✅ **複数対応**（2025年1月）
10. ✅ **共通と個別の位置を交換**（2025年1月）
11. ✅ **API対応**（2025年1月）
12. ✅ **スマホ対応**（2025年1月、スワイプジェスチャーはスキップ）
13. ✅ **タグの動的変更**（2025年1月）
14. ✅ **データ永続化の改善**（2025年1月）
    - `sessionStorage`から`localStorage`に変更（別窓でのデータ連動のため）
    - 呼び出し側でリセットボタンを実装（本番環境では不要のため、ZeroCode側には実装しない）

### 保留・スキップ機能

- **権限注意書き**: スキップ（サーバー側で実装されるため）
- **使い方の説明**: 保留（技術ドキュメントは一般ユーザーには不適切）
- **追加パネルのUI改善**: 保留（既存機能で十分）
- **アクセシビリティ対応**: 検討事項（優先度低）
- **複数保存ポイント（バージョン管理）**: 検討事項（優先度低）

### 未実装機能

- **英語対応（i18n）**: 仕様確定、実装保留
- **テストコード**: 最終的に検討

## 開発開始時のチェックリスト

新しい機能を実装する前に、以下を確認してください：

### ✅ 実装前の確認事項

- [ ] `TODO.md`でタスクの詳細を確認
- [ ] 関連する既存機能を確認（`AGENTS.md`の「実装済み機能」セクション）
- [ ] データ構造を確認（`AGENTS.md`の「データ構造」セクション）
- [ ] テンプレート記法の仕様を確認（`AGENTS.md`の「テンプレート記法」セクション）
- [ ] 実装時の注意事項を確認（`AGENTS.md`の「実装時の注意事項」セクション）
- [ ] ファイル構成を確認（`AGENTS.md`の「ファイル構成」セクション）
- [ ] 関連する既存コードを確認（参考リンクから）

### ✅ 実装中の確認事項

- [ ] コーディングスタイルに従っている（`AGENTS.md`の「コードスタイル」セクション）
- [ ] HTMLタグの使用方針に従っている（`AGENTS.md`の「HTMLタグの使用方針」セクション）
- [ ] テンプレート記法の処理順序を守っている（`AGENTS.md`の「テンプレート記法の処理順序」セクション）
- [ ] イベントの仕様に従っている（`AGENTS.md`の「イベント」セクション）

### ✅ 実装後の更新事項

- [ ] `TODO.md`の該当タスクを完了に更新
- [ ] `AGENTS.md`の「実装済み機能」に追加（必要に応じて）
- [ ] `TECHNICAL_SPECIFICATION.md`を更新（API変更がある場合）
- [ ] `docs.html`を更新（ユーザー向けドキュメントに影響がある場合）

## 実装時の注意事項

### データ保存の仕様

- **保存は`save-request`イベントのみ**: `change`イベントは削除済み
- **保存ボタンクリック時のみ発火**: 自動保存は行わない
- **画像追加時の自動保存は行わない**: 保存ボタンで一括保存
- **編集モードでの保存対象**: `page`、`images-common`、`images-individual`、`images-special`（CSSは除外）
- **パーツ管理での保存対象**: `parts-common`/`parts-individual`/`parts-special`、対応する`parts-common-css`/`parts-individual-css`/`parts-special-css`

### テンプレート記法の実装

- **処理順序を守る**: `z-if` → `z-tag` → `z-empty` → `z-for` → `z-slot`の順で処理
- **特殊属性の削除**: 各処理内で個別に属性を削除（`z-if`、`z-empty`、`z-for`、`z-slot`は処理後に削除、`z-tag`は新しい要素にコピーしない）
- **セキュリティ**: 有効なタグ名のみ許可（`z-tag`の場合）
- **オプショナルフィールド**: `undefined`のまま残す（初期化しない）

### コンポーネント初期化

- **データ読み込み時に自動実行**: `loadDataFromProps`関数内で`initializeAllComponentFields`を呼び出し
- **再帰的処理**: スロット内の子コンポーネントも処理
- **オプショナルフィールドはスキップ**: `undefined`のまま

### イベント処理

- **`save-request`イベント**: 保存ボタンクリック時のみ発火
- **`save-result`イベント**: 各ターゲットごとに発火（`requestId`で対応付け）
- **`zcode-dom-updated`イベント**: DOM更新時に発火（動的コンテンツの初期化用）

## 実装パターン集

よく使う実装パターンをまとめています。新しい機能を実装する際の参考にしてください。

### パターン1: 新しいテンプレート記法を追加する

**手順:**

1. `extractFieldsFromTemplate`でフィールド情報を抽出
2. `processTemplateWithDOM`でテンプレートを処理
3. 編集パネルでUIを追加（必要に応じて）

**例: 新しいフィールドタイプ「カラー」を追加する場合**

```typescript
// src/core/utils/template-processor.ts

// 1. extractFieldsFromTemplateで抽出
const colorRegex = /\{\$(\w+):([^:}]+):color\}/g;
// ... マッチした場合、type: 'color'を設定

// 2. processTemplateWithDOMで処理
if (field.type === 'color') {
  const colorValue = component[field.name] || field.defaultValue;
  // カラー値で置換
}
```

### パターン2: 新しいイベントを発火する

**手順:**

1. `dispatchEvent`でカスタムイベントを発火
2. イベント詳細を`detail`に含める
3. `TECHNICAL_SPECIFICATION.md`に仕様を記載

**例: `component-added`イベントを追加する場合**

```typescript
// src/components/ZeroCodeCMS.vue

const handleAddComponent = () => {
  // ... コンポーネント追加処理

  dispatchEvent('component-added', {
    componentId: newComponent.id,
    partId: newComponent.part_id,
    path: componentPath,
    timestamp: Date.now()
  });
};
```

### パターン3: 新しいコンポーザブルを作成する

**手順:**

1. `src/features/`配下に適切なディレクトリを作成
2. `composables/`ディレクトリに`use*.ts`を作成
3. Composition APIのパターンに従う

**例: `useValidation.ts`を作成する場合**

```typescript
// src/features/validation/composables/useValidation.ts

import { ref, computed } from 'vue';
import type { ComponentData } from '../../../types';

export function useValidation() {
  const errors = ref<Record<string, string>>({});

  const validate = (component: ComponentData, fieldName: string) => {
    // バリデーション処理
  };

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0;
  });

  return {
    errors,
    validate,
    isValid
  };
}
```

### パターン4: データの取得・設定を行う

**手順:**

1. `useZeroCodeData`から`getData`と`setData`を取得
2. パスを指定してデータを操作

**例: コンポーネントのフィールドを更新する場合**

```typescript
import { useZeroCodeData } from '@/core/composables/useZeroCodeData';

const { getData, setData } = useZeroCodeData();

// データ取得
const component = getData('page', [0]); // page[0]のコンポーネント

// データ設定
setData('page', [0, 'title'], '新しいタイトル');
```

**注意**: `getData`と`setData`の実際のAPIは異なります。正しい使用方法は以下を参照：

```typescript
// 実際のAPI（useZeroCodeData.tsより）
const { getData, setData } = useZeroCodeData(props);

// データ取得（パス文字列で指定）
const pageData = getData('page'); // pageデータ全体
const component = pageData[0]; // 最初のコンポーネント

// データ設定（パス文字列と値で指定）
setData('page.0.title', '新しいタイトル');
// または全体更新
setData({ page: [...], parts: {...}, ... });
```

### パターン5: テンプレート記法の処理順序を守る

**重要**: テンプレート記法は必ず以下の順序で処理してください。

```typescript
// src/core/utils/template-processor.ts の processTemplateWithDOM 内

// 1. テキストノードの変数展開
// 2. 属性内の変数展開
// 3. z-if 処理
// 4. z-tag 処理
// 5. z-empty 処理
// 6. z-for 処理
// 7. z-slot 処理
```

### パターン6: コンポーネントの初期化処理を追加する

**手順:**

1. `component-initializer.ts`の`getDefaultFieldValue`に新しいタイプを追加
2. 必要に応じて`initializeComponentFields`を拡張

**例: 新しいフィールドタイプのデフォルト値を設定**

```typescript
// src/core/utils/component-initializer.ts

function getDefaultFieldValue(field: FieldInfo): any {
  switch (field.type) {
    case 'color':
      return field.defaultValue || '#000000';
    // ... 他のタイプ
  }
}
```

## トラブルシューティング

よくある問題と解決方法をまとめています。

### 問題1: テンプレート記法が正しく処理されない

**症状:**

- フィールドが表示されない
- デフォルト値が適用されない
- 条件分岐が動作しない

**確認事項:**

1. テンプレート記法の構文が正しいか確認
2. `extractFieldsFromTemplate`でフィールドが正しく抽出されているか確認
3. `processTemplateWithDOM`の処理順序が正しいか確認
4. ブラウザのコンソールでエラーがないか確認

**解決方法:**

```typescript
// デバッグ用: フィールド情報を確認
const fields = extractFieldsFromTemplate(template);
console.log('Extracted fields:', fields);

// デバッグ用: 処理後のHTMLを確認
const processed = processTemplateWithDOM(template, component, ...);
console.log('Processed HTML:', processed);
```

### 問題2: イベントが発火しない

**症状:**

- `save-request`イベントが発火しない
- カスタムイベントがリスナーに届かない

**確認事項:**

1. `dispatchEvent`が正しく呼び出されているか確認
2. イベント名が正しいか確認（ケバブケース: `save-request`）
3. イベントリスナーが正しく設定されているか確認
4. Web Componentsのイベントバブリングを確認

**解決方法:**

```typescript
// イベント発火の確認
const event = dispatchEvent('save-request', { ... });
console.log('Event dispatched:', event);

// イベントリスナーの確認
element.addEventListener('save-request', (e) => {
  console.log('Event received:', e.detail);
});
```

### 問題3: データが保存されない

**症状:**

- 保存ボタンをクリックしてもデータが更新されない
- `save-result`イベントでエラーが返る

**確認事項:**

1. `save-request`イベントが正しく発火しているか確認
2. `targets`配列が正しく設定されているか確認
3. サーバー側のエラーレスポンスを確認
4. バリデーションエラーがないか確認

**解決方法:**

```typescript
// save-requestイベントの確認
element.addEventListener('save-request', (e) => {
  console.log('Save request:', e.detail);
  // targets配列を確認
  console.log('Targets:', e.detail.targets);
});

// save-resultイベントの確認
element.addEventListener('save-result', (e) => {
  console.log('Save result:', e.detail);
  if (!e.detail.ok) {
    console.error('Errors:', e.detail.errors);
  }
});
```

### 問題4: コンポーネントの初期化が動作しない

**症状:**

- 新しいフィールドが初期化されない
- デフォルト値が適用されない

**確認事項:**

1. `initializeAllComponentFields`が呼び出されているか確認
2. オプショナルフィールドの場合は初期化されない（仕様）
3. テンプレートにフィールドが定義されているか確認

**解決方法:**

```typescript
// 初期化処理の確認
import { initializeAllComponentFields } from '@/core/utils/component-initializer';

// データ読み込み後に自動実行されるが、手動で確認する場合
const initialized = initializeAllComponentFields(cmsData);
console.log('Initialized components:', initialized);
```

### 問題5: テンプレート記法の処理順序が正しくない

**症状:**

- `z-if`と`z-for`が同時に使えない
- 条件分岐が期待通りに動作しない

**確認事項:**

1. 処理順序が正しいか確認（`z-if` → `z-tag` → `z-empty` → `z-for` → `z-slot`）
2. 特殊属性が正しく削除されているか確認
3. ネストされた記法の処理を確認

**解決方法:**

```typescript
// 処理順序の確認
// processTemplateWithDOM内で各処理の前後にログを追加
console.log('Processing z-if...');
// z-if処理
console.log('Processing z-tag...');
// z-tag処理
// ...
```

### 問題6: パフォーマンスの問題

**症状:**

- 大量のコンポーネントで遅延が発生する
- レンダリングが重い

**確認事項:**

1. 不要な再レンダリングがないか確認
2. 大量データの処理方法を確認
3. メモ化が必要か確認

**解決方法:**

```typescript
// パフォーマンス測定
const start = performance.now();
// 処理実行
const end = performance.now();
console.log(`Processing time: ${end - start}ms`);

// Vueのcomputedやwatchの最適化
const expensiveValue = computed(() => {
  // 重い処理
});
```

## 参考リンク

### 主要なソースファイル

- [テンプレートプロセッサー](./src/core/utils/template-processor.ts) - テンプレート記法の処理
- [コンポーネント初期化](./src/core/utils/component-initializer.ts) - フィールドの自動初期化
- [ZeroCodeCMS](./src/components/ZeroCodeCMS.vue) - ユーザー用管理画面
- [ZeroCodeEditor](./src/components/ZeroCodeEditor.vue) - エンジニア用管理画面
- [データ管理](./src/core/composables/useZeroCodeData.ts) - データの読み込み・取得・設定

### ドキュメント

- [TODO.md](./TODO.md) - 実装タスク一覧
- [技術仕様書](./TECHNICAL_SPECIFICATION.md) - 外部向け技術仕様
- [ドキュメント](./docs.html) - ユーザー向けドキュメント

---

**最終更新日**: 2025年1月
