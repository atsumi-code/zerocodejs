# ZeroCode.js 技術仕様書

> **このファイルの目的**: 外部向けの技術仕様書です。APIの詳細仕様、Web Componentsの使用方法、セキュリティに関する情報を提供します。

**AI開発時**: 実装の詳細は`AGENTS.md`を参照してください。このファイルは主に外部向けのドキュメントです。

## 概要

ZeroCode.jsは、フレームワーク非依存のWeb ComponentsベースのCMSエディターライブラリです。Vue.jsで実装されており、カスタムHTMLテンプレート構文を使用して動的なコンテンツ管理を提供します。

## アーキテクチャ

### コンポーネント構成

```
ZeroCodeEditor (エンジニア用管理画面)
├── ZeroCodeCMS (ユーザー用管理画面)
│   ├── Toolbar (ツールバー)
│   ├── PreviewArea (プレビューエリア)
│   ├── EditPanel (編集パネル)
│   ├── AddPanel (追加パネル)
│   ├── DeletePanel (削除パネル)
│   ├── ReorderPanel (並べ替えパネル)
│   └── SettingsPanel (設定パネル)
├── PartsManagerPanel (パーツ管理パネル)
├── ImagesManagerPanel (画像管理パネル)
└── DataViewer (データビューア)
```

### データ構造

#### ZeroCodeData

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

#### ComponentData

```typescript
interface ComponentData {
  id: string;
  part_id: string; // パーツID（タイトル変更時も紐付けが維持される）
  [key: string]: any;
  slots?: Record<string, ComponentData[] | SlotConfig>;
}
```

#### SlotConfig

```typescript
interface SlotConfig {
  allowedParts?: string[]; // 許可されるパーツID
  children?: ComponentData[]; // 子コンポーネント
}
```

#### TypeData

```typescript
interface TypeData {
  id: string; // タイプID（タイプ変更時も紐付けが維持される）
  type: string;
  description: string;
  parts: PartData[];
}
```

#### PartData

```typescript
interface PartData {
  id: string; // パーツID（タイトル変更時も紐付けが維持される）
  title: string;
  description: string;
  body: string;
  slots?: Record<string, { allowedParts?: string[] }>;
  slotOnly?: boolean; // スロット専用パーツ
}
```

#### ImageData

```typescript
interface ImageData {
  id: string;
  name: string;
  url: string;
  mimeType?: string; // MIMEタイプ（base64画像の場合）
  needsUpload?: boolean; // アップロードが必要かどうか
}
```

## Web Components

### zcode-cms

ユーザー用管理画面のWebコンポーネント。

**属性**:

- `locale`: ロケール設定（デフォルト: `'ja'`）
- `page`: ページデータ（JSON文字列）
- `parts-common`: 共通パーツデータ（JSON文字列）
- `parts-individual`: 個別パーツデータ（JSON文字列）
- `images-common`: 共通画像データ（JSON文字列）
- `images-individual`: 個別画像データ（JSON文字列）
- `images-special`: 特別画像データ（JSON文字列）
- `css-common`: 共通パーツ用CSS（文字列）
- `css-individual`: 個別パーツ用CSS（文字列）
- `css-special`: 特別パーツ用CSS（文字列）
- `backend-data`: バックエンドデータ（JSON文字列）
- `config`: 初期設定データ（JSON文字列）。`{"cms": {...}, "dev": {...}}`の形式で指定。詳細は「設定オプション」セクションを参照
- `endpoints`: エンドポイント設定（JSON文字列）
- `use-shadow-dom`: Shadow DOMを使用するか（`'true'` | `'false'`）

**スロット**:

- `css`: CSSファイルを指定
- `script`: JavaScriptファイルを指定

**メソッド**:

- `getData(path?: string)`: データを取得
- `setData(path: string | object, value?: any)`: データを設定

**プロパティ**:

- `allowDynamicContentInteraction`: 動的コンテンツの動作を有効/無効にする（getter/setter）

**イベント**:

- `save-request`: 保存ボタンクリック時に発火（保存リクエスト）
- `save-result`: 保存処理完了時に発火（保存結果）
- `zcode-dom-updated`: DOMが更新されたときに発火

**使用例**:

```html
<zcode-cms id="cms" locale="ja">
  <link slot="css" rel="stylesheet" href="/css/common.css" />
  <script slot="script" src="/js/accordion.js"></script>
</zcode-cms>
```

### zcode-editor

エンジニア用管理画面のWebコンポーネント。

**属性**:

- `locale`: ロケール設定（デフォルト: `'ja'`）
- `page`: ページデータ（JSON文字列）
- `parts-common`: 共通パーツデータ（JSON文字列）
- `parts-individual`: 個別パーツデータ（JSON文字列）
- `images-common`: 共通画像データ（JSON文字列）
- `images-individual`: 個別画像データ（JSON文字列）
- `images-special`: 特別画像データ（JSON文字列）
- `css-common`: 共通パーツ用CSS（文字列）
- `css-individual`: 個別パーツ用CSS（文字列）
- `css-special`: 特別パーツ用CSS（文字列）
- `backend-data`: バックエンドデータ（JSON文字列）
- `config`: 初期設定データ（JSON文字列）。`{"cms": {...}, "dev": {...}}`の形式で指定。詳細は「設定オプション」セクションを参照
- `endpoints`: エンドポイント設定（JSON文字列）
- `enable-parts-manager`: パーツ管理を有効にするか（デフォルト: `true`）
- `enable-images-manager`: 画像管理を有効にするか（デフォルト: `true`）
- `use-shadow-dom`: Shadow DOMを使用するか（`'true'` | `'false'`）

**スロット**:

- `css`: CSSファイルを指定
- `script`: JavaScriptファイルを指定

**メソッド**:

- `getData(path?: string)`: データを取得
- `setData(path: string | object, value?: any)`: データを設定

**プロパティ**:

- `allowDynamicContentInteraction`: 動的コンテンツの動作を有効/無効にする（getter/setter）

**使用例**:

```html
<zcode-editor id="editor" locale="ja">
  <link slot="css" rel="stylesheet" href="/css/common.css" />
  <script slot="script" src="/js/accordion.js"></script>
</zcode-editor>
```

## 設定オプション

### 設定の構造

設定は`cms`と`dev`の2つのカテゴリに分離されています。`zcode-cms`と`zcode-editor`の両方で編集モード（CMS）の設定は共有されます。

#### localStorageの構造

```json
{
  "cms": {
    "allowDynamicContentInteraction": false,
    "devRightPadding": false,
    "enableContextMenu": false
  },
  "dev": {
    "showDataViewer": false,
    "enableTemplateSuggestions": false
  }
}
```

#### 初期設定（config属性）

`config`属性で初期設定を指定できます。JSON文字列として指定します。

```html
<zcode-cms
  config='{"cms": {"allowDynamicContentInteraction": true, "devRightPadding": true, "enableContextMenu": true}}'
></zcode-cms>

<zcode-editor
  config='{"cms": {"allowDynamicContentInteraction": true}, "dev": {"showDataViewer": true}}'
></zcode-editor>
```

または、JavaScript変数で指定することもできます：

```javascript
const cmsConfig = {
  cms: {
    allowDynamicContentInteraction: true,
    devRightPadding: true,
    enableContextMenu: true
  }
};

const cmsElement = document.getElementById('test-cms');
cmsElement.setAttribute('config', JSON.stringify(cmsConfig));
```

#### 設定の優先順位

1. **localStorage**: ユーザーが変更した設定（最優先）
2. **config属性**: 初期設定として指定された値
3. **デフォルト値**: 全て`false`

**動作フロー**:

- 初回起動時: `config`属性の値が初期値として使用される
- ユーザーが設定を変更: localStorageに保存される
- 次回起動時: localStorageの値が使用され、`config`属性は無視される

### CMS設定（`cms`）

`zcode-cms`と`zcode-editor`の両方で共有される設定です。

#### 設定項目

- **`allowDynamicContentInteraction`** (デフォルト: `false`)
  - アコーディオン、タブ、モーダル、リンクなどの動的コンテンツの動作を有効/無効にする
  - 設定パネルでは「ページの動作を有効にする」として表示

- **`devRightPadding`** (デフォルト: `false`)
  - 編集パネル表示時にコンテンツの右余白を追加する
  - 設定パネルでは「編集パネル分の余白をつける」として表示

- **`enableContextMenu`** (デフォルト: `false`)
  - 右クリックメニューを有効にする
  - 設定パネルでは「右クリックメニューを有効にする」として表示

### Dev設定（`dev`）

`zcode-editor`専用の設定です。

#### 設定項目

- **`showDataViewer`** (デフォルト: `false`)
  - データビューアを表示する
  - 設定パネルでは「データビューアを表示」として表示

- **`enableTemplateSuggestions`** (デフォルト: `false`)
  - テンプレート記法の予測変換を有効にする
  - パーツ管理パネルのエディタで使用

### 設定モーダル

#### ツールバー用設定（ZeroCodeCMS）

`SettingsPanel`に`mode="toolbar"`を指定した場合に表示される設定：

- **ページの動作を有効にする**: `allowDynamicContentInteraction`の設定
- **編集パネル分の余白をつける**: `devRightPadding`の設定
- **右クリックメニューを有効にする**: `enableContextMenu`の設定

#### dev-tabs用設定（ZeroCodeEditor）

`SettingsPanel`に`mode="dev-tabs"`を指定した場合に表示される設定：

- **データビューアを表示**: `showDataViewer`の設定

### 設定の型定義

```typescript
interface ImageModalActionsCategory {
  add?: boolean;
  delete?: boolean;
}

interface ImageModalActionsConfig {
  common?: ImageModalActionsCategory;
  individual?: ImageModalActionsCategory;
  special?: ImageModalActionsCategory;
}

interface CMSSettings {
  allowDynamicContentInteraction?: boolean;
  devRightPadding?: boolean;
  enableContextMenu?: boolean;
  imageModalActions?: ImageModalActionsConfig; // 画像選択モーダルで共通/個別/特別ごとに追加・削除ボタンを表示するか（未指定時は非表示）
}

interface DevSettings {
  showDataViewer?: boolean;
  enableTemplateSuggestions?: boolean;
}

interface CMSConfig {
  enableVirtualization?: boolean;
  autoSaveInterval?: number;
  maxBackups?: number;
  theme?: 'light' | 'dark';
  cms?: CMSSettings;
  dev?: DevSettings;
}

interface UserSettings {
  cms?: CMSSettings;
  dev?: DevSettings;
}
```

### 実装例

```typescript
// ZeroCodeCMS.vue
// configをパース
const parseConfig = (configString?: string): Partial<CMSConfig> => {
  if (!configString) return {};
  try {
    return JSON.parse(configString);
  } catch (e) {
    console.warn('[ZeroCodeCMS] Failed to parse config:', e);
    return {};
  }
};

const config = parseConfig(props.config);

// 初期値の読み込みロジック（優先順位: localStorage > config.cms > デフォルト値）
const getInitialCMSValue = <K extends keyof CMSSettings>(
  key: K,
  defaultValue: NonNullable<CMSSettings[K]>,
  configValue?: boolean
): NonNullable<CMSSettings[K]> => {
  const stored = loadCMSSettings();
  // localStorageに値があればそれを使用（ユーザーが変更した値）
  if (stored[key] !== undefined) {
    return stored[key] as NonNullable<CMSSettings[K]>;
  }
  // localStorageに値がなければ、config.cmsの値を使用（初期設定）
  if (configValue !== undefined) {
    return configValue as NonNullable<CMSSettings[K]>;
  }
  // それもなければデフォルト値
  return defaultValue;
};

// 設定の初期化（デフォルト値は全てfalse）
const devRightPadding = ref(
  getInitialCMSValue('devRightPadding', false, config.cms?.devRightPadding)
);
const allowDynamicContentInteraction = ref(
  getInitialCMSValue(
    'allowDynamicContentInteraction',
    false,
    config.cms?.allowDynamicContentInteraction
  )
);
const enableContextMenu = ref(
  getInitialCMSValue('enableContextMenu', false, config.cms?.enableContextMenu)
);

// 設定変更時にlocalStorageに保存
watch(devRightPadding, (newValue) => {
  saveCMSSettings({ devRightPadding: newValue });
});

watch(allowDynamicContentInteraction, (newValue) => {
  if (viewMode.value === 'manage') {
    saveCMSSettings({ allowDynamicContentInteraction: newValue });
  }
});

watch(enableContextMenu, (newValue) => {
  saveCMSSettings({ enableContextMenu: newValue });
});
```

## 編集モード

### edit（編集モード）

既存のコンポーネントを編集するモード。

**機能**:

- コンポーネントのフィールドを編集
- 親要素への移動（「親要素を選択」ボタン）
- 同じパーツをクリックした場合はパネルを閉じる

### add（追加モード）

新しいコンポーネントを追加するモード。

**機能**:

- パーツタイプを選択して追加
- 既存コンポーネントをコピーして追加（表示側で選択したパーツをコピー）
- 追加位置の選択（前に追加/後に追加）
- 親要素への移動（「親要素を選択」ボタン）
- パーツ追加を続けるオプション

### delete（削除モード）

コンポーネントを削除するモード。

**機能**:

- 削除確認
- 親要素への移動（「親要素を選択」ボタン）

### reorder（並べ替えモード）

コンポーネントの順序を変更するモード。

**機能**:

- 移動元を選択
- 移動先をクリックして並べ替え
- 親要素への移動（「親要素を選択」ボタン）

## 親要素選択

各編集モードで使用可能な親要素選択機能。

**機能**:

- 「親要素を選択」ボタンで親要素に移動
- 親要素がない場合はボタンが非表示になる
- 移動時に自動的にスクロールして移動先を表示

## パネル配置

編集パネルは`position: sticky`で配置され、画面右側に固定表示されます。

**実装**:

- `.zcode-panels-wrapper`に`position: sticky`を適用
- パネルが表示されている場合、`zcode-cms-container`に`zcode-dev-padding`クラスが追加され、右余白300pxが設定される（`devRightPadding`設定で有効化した場合）

## テンプレート構文

### フィールド参照

#### テキストフィールド

```
{$fieldName:defaultValue}
```

**例**:

```html
<h1>{$title:タイトル}</h1>
```

#### リッチテキストフィールド

```
{$fieldName:defaultValue:rich}
```

**例**:

```html
<p>{$description:説明文:rich}</p>
```

#### 画像フィールド

```
{$fieldName:defaultValue:image}
```

**例**:

```html
<img src="{$image:default.jpg:image}" alt="画像" />
```

#### ラジオボタン

```
($fieldName:option1|option2|option3)
```

**例**:

```html
<div>($color:red|blue|green)</div>
```

#### チェックボックス

```
($fieldName:option1,option2,option3)
```

**例**:

```html
<div>($tags:tag1,tag2,tag3)</div>
```

#### セレクトボックス（単一選択）

```
($fieldName@:option1|option2|option3)
```

**例**:

```html
<div>($color@:red|blue|green)</div>
```

#### セレクトボックス（複数選択）

```
($fieldName@:option1,option2,option3)
```

**例**:

```html
<div>($tags@:tag1,tag2,tag3)</div>
```

#### オプショナルフィールド

```
{$fieldName?:defaultValue}
```

空入力時は`undefined`になります。

**例**:

```html
<div>{$subtitle?:サブタイトル}</div>
```

#### グループ化

```
{$fieldName.groupName:defaultValue}
($fieldName.groupName@:option1|option2)
```

編集パネルでフィールドをグループ化できます。

**例**:

```html
<div>{$title.basic:タイトル}</div>
<div>($color.basic@:red|blue|green)</div>
```

#### バリデーション

```
{$fieldName:defaultValue:required:max=100}
{$fieldName:defaultValue:readonly}
{$fieldName:defaultValue:disabled}
```

**例**:

```html
<input type="text" value="{$title:タイトル:required:max=50}" />
<input type="text" value="{$readonlyField:読み取り専用:readonly}" />
<input type="text" value="{$disabledField:無効化:disabled}" />
```

#### バックエンドデータ

```
{@fieldName}
{@user.name}
{@items[0]}
{@items[0].name}
{@items.length}
```

バックエンドから渡されたデータを参照します。

**例**:

```html
<h1>{@title}</h1>
<a href="{@url}">リンク</a>
<div>{@items.length}件</div>
```

### 条件分岐・制御

#### 条件分岐（z-if）

`z-if` は表示するかしないかを決めます。fieldName に紐づく形ではありません（fieldName に紐づくのは z-empty）。属性値に指定したキーの真偽で、要素を表示または削除します。

```
<element z-if="showContent">
  <!-- 条件が真の場合に表示 -->
</element>
```

- 真（`true`、非空文字列など）→ 表示
- 偽（`false`、`null`、空文字列、`0`）→ 要素を削除
- 指定キーが存在しない（`undefined`）→ 表示として扱う

**例**:

```html
<div z-if="showContent">
  <p>コンテンツが表示されます</p>
</div>
```

#### タグの動的変更

```
<element z-tag="$tagName:h1|h2|h3">
  <!-- コンテンツ -->
</element>
```

テンプレートで書いたタグ名がデフォルト値として使用されます。

**例**:

```html
<h2 z-tag="$headingTag:h1|h2|h3" class="title">{$title:タイトル}</h2>
```

#### 空要素の削除（z-empty）

`z-empty` は `$fieldName` で指定したフィールドに紐づきます。そのフィールドが空（`undefined`、`null`、空文字列、実質的に空のrichテキスト）の場合、親要素を削除します。

```
<element z-empty="$fieldName">
  <!-- コンテンツ -->
</element>
```

**例**:

```html
<div z-empty="$subtitle">
  <p>{$subtitle?:サブタイトル}</p>
</div>
```

#### ループ

```
<element z-for="item in {@items}">
  <!-- コンテンツ -->
</element>
```

バックエンドデータの配列をループします。

**例**:

```html
<div z-for="shop in {@shops}">
  <h2>{shop.name}</h2>
  <a href="{shop.url}">詳細</a>
</div>
```

### スロット

```
<element z-slot="slotName">
  <!-- スロットコンテンツ -->
</element>
```

**例**:

```html
<div z-slot="header">
  <h1>ヘッダー</h1>
</div>
```

**スロット設定**:

- `PartData`の`slots`プロパティで`allowedParts`を指定することで、スロットに追加可能なパーツを制限できる

⚠️ **セキュリティ注意**: テンプレート構文で属性値にユーザー入力を設定する場合、基本的なエスケープ処理とURL検証が適用されますが、**サーバー側での検証を必ず実装してください。**

## API

### ZeroCodeCMS

#### メソッド

- `getData(path?: string)`: データを取得
  - `path`を指定しない場合: 全体のデータを返す
  - `path`を指定した場合: 指定したパスのデータを返す
- `setData(path: string | object, value?: any)`: データを設定
  - `path`が文字列の場合: 指定したパスに値を設定
  - `path`がオブジェクトの場合: オブジェクト全体を設定
  - ⚠️ **セキュリティ注意**: このメソッドはクライアント側から任意のデータを設定できます。開発者ツールからも呼び出し可能です。**サーバー側での検証を必ず実装してください。**

#### イベント

- `save-request`: 保存ボタンクリック時に発火（保存リクエスト）
  - `detail.requestId`: リクエストID（`save-result`で使用）
  - `detail.source`: 送信元（`'cms'` または `'editor'`）
  - `detail.targets`: 保存対象の配列
    - zcode-cms 編集モード: `['page', 'images-common', 'images-individual']`（`images-special` は含まれない）
    - zcode-editor ページ管理: タブ・カテゴリに応じ `images-special` 等が加わる場合あり
    - パーツ管理: `[primaryTarget, 'parts-*-css']`
    - 画像管理: `['images-common']` / `['images-individual']` / `['images-special']`
  - `detail.timestamp`: タイムスタンプ
  - `detail` に `data` は含まれない。受信側で `getData()` を呼んで取得する。
  - ⚠️ **セキュリティ注意**: `source`を確認し、CMSからのパーツ保存をサーバー側で拒否すること。
- `save-result`: 保存処理完了時に発火（保存結果）
  - `detail.requestId`: `save-request`の`requestId`と同じ値
  - `detail.target`: 保存対象（`'page'`, `'parts-common'`, `'parts-individual'`, `'parts-special'`, `'images-common'`, `'images-individual'`, `'images-special'`, `'parts-common-css'`, `'parts-individual-css'`, `'parts-special-css'`）- 各ターゲットごとに発火される
  - `detail.ok`: 保存成功かどうか
  - `detail.errors`: エラー情報の配列
- `zcode-dom-updated`: DOMが更新されたときに発火

### ZeroCodeEditor

#### メソッド

- `getData(path?: string)`: データを取得
- `setData(path: string | object, value?: any)`: データを設定
  - ⚠️ **セキュリティ注意**: このメソッドはクライアント側から任意のデータを設定できます。開発者ツールからも呼び出し可能です。**サーバー側での検証を必ず実装してください。**

#### プロパティ

- `allowDynamicContentInteraction`: 動的コンテンツの動作を有効/無効にする（getter/setter）

### サーバーサイドレンダリング

#### 関数

- `renderToHtml(data: ZeroCodeData, options?: { enableEditorAttributes?: boolean }): string`: データからHTML文字列を生成
  - `data`: ZeroCodeData形式のデータ
  - `options.enableEditorAttributes`: 編集用属性を有効にするか（デフォルト: `false`）
  - 戻り値: 生成されたHTML文字列
  - ⚠️ **セキュリティ注意**:
    - この関数は属性値に対して基本的なエスケープ処理とURL検証を行いますが、完全なセキュリティ保証はできません。
    - **パーツテンプレート（`part.body`）は信頼できるソースからのみ使用してください。**
    - **style属性にユーザー入力を直接設定する場合は、サーバー側での検証を推奨します。**
    - **サーバー側でのデータ検証を必ず実装してください。**

## セキュリティ

### 概要

ZeroCode.jsはフロントエンドライブラリのため、クライアント側での完全なセキュリティ保証はできません。以下の対策を実装してください。

### 推奨事項

#### 1. サーバー側での検証（必須）

- **データ保存前の検証**: すべてのデータをサーバー側で検証してください
- **パーツテンプレートの検証**: パーツテンプレート（`part.body`）が信頼できるソースからのみ来ることを確認してください
- **送信元の検証**: `save-request`イベントの`source`フィールドを確認し、CMSからのパーツデータ保存を拒否してください

#### 2. 属性値のセキュリティ

- **URL属性**: `href`, `src`, `action`属性には基本的なURL検証が適用されますが、サーバー側での追加検証を推奨します
- **style属性**: style属性にユーザー入力を直接設定する場合は、サーバー側での検証を推奨します
- **その他の属性**: 基本的なエスケープ処理が適用されますが、サーバー側での検証を推奨します

#### 3. パーツテンプレートの管理

- **信頼できるソース**: パーツテンプレートは信頼できるソースからのみ受け入れてください
- **テンプレートの検証**: サーバー側でテンプレートの妥当性を検証してください

#### 4. 認証・認可

- **権限管理**: パーツデータの変更は認証されたユーザーのみ許可してください
- **ロールベースアクセス**: ユーザーのロールに応じて操作を制限してください

### 実装例

```javascript
// クライアント側: detail に data は含まれない。getData() で取得する。
cms.addEventListener('save-request', async (event) => {
  const { requestId, source, targets, timestamp } = event.detail;
  const data = cms.getData();

  for (const target of targets) {
    try {
      if (source === 'cms' && target.startsWith('parts-')) {
        cms.dispatchEvent(
          new CustomEvent('save-result', {
            detail: {
              requestId,
              target,
              ok: false,
              errors: [{ message: '権限がありません', code: 'FORBIDDEN' }]
            }
          })
        );
        continue;
      }

      let dataToSave;
      switch (target) {
        case 'page':
          dataToSave = data.page;
          break;
        case 'parts-common-css':
          dataToSave = data.css?.common || '';
          break;
        case 'parts-individual-css':
          dataToSave = data.css?.individual || '';
          break;
        case 'parts-special-css':
          dataToSave = data.css?.special || '';
          break;
        case 'parts-common':
          dataToSave = data.parts?.common || [];
          break;
        case 'parts-individual':
          dataToSave = data.parts?.individual || [];
          break;
        case 'images-common':
          dataToSave = data.images?.common || [];
          break;
        case 'images-individual':
          dataToSave = data.images?.individual || [];
          break;
        case 'images-special':
          dataToSave = data.images?.special || [];
          break;
        case 'parts-special':
          dataToSave = data.parts?.special || [];
          break;
        default:
          continue;
      }

      // データの検証
      if (!validateDataStructure(dataToSave)) {
        cms.dispatchEvent(
          new CustomEvent('save-result', {
            detail: {
              requestId,
              target,
              ok: false,
              errors: [{ message: '無効なデータです', code: 'INVALID_DATA' }]
            }
          })
        );
        continue;
      }

      // パーツテンプレートの検証
      if (target.startsWith('parts-') && !validatePartTemplate(dataToSave)) {
        cms.dispatchEvent(
          new CustomEvent('save-result', {
            detail: {
              requestId,
              target,
              ok: false,
              errors: [{ message: '無効なテンプレートです', code: 'INVALID_TEMPLATE' }]
            }
          })
        );
        continue;
      }

      // 保存処理
      await saveToDatabase(target, dataToSave);

      // 成功時
      cms.dispatchEvent(
        new CustomEvent('save-result', {
          detail: {
            requestId,
            target,
            ok: true,
            errors: []
          }
        })
      );
    } catch (error) {
      // エラー時
      cms.dispatchEvent(
        new CustomEvent('save-result', {
          detail: {
            requestId,
            target,
            ok: false,
            errors: [{ message: error.message, code: 'SAVE_FAILED' }]
          }
        })
      );
    }
  }
});
```

## パーツ管理

### タイプとパーツ

- **タイプ（Type）**: パーツのグループ。複数のパーツを含む
- **パーツ（Part）**: 実際のコンポーネントテンプレート

### 共通パーツと個別パーツ

- **共通パーツ**: すべてのページで使用可能なパーツ
- **個別パーツ**: 特定のページでのみ使用可能なパーツ

### パーツ管理機能

- タイプの作成・編集・削除
- パーツの作成・編集・削除
- タイプ間の並べ替え
- パーツのプレビュー表示
- Monaco Editorによるコード編集

## 画像管理

### 画像管理機能

- 画像のアップロード
- 画像の編集（ID、名前、URL、alt）
- 画像の削除
- 共通画像と個別画像の管理

### 画像選択モーダル

編集パネルから画像を選択する際に表示されるモーダル。

- 共通画像と個別画像の切り替え
- 画像のプレビュー表示
- 画像の追加・削除

## データビューア

### 機能

- CMSデータをJSON/HTML形式で表示
- データのコピー機能
- 保存ボタンで出し分け（選択中のタブとカテゴリに応じて適切なターゲットで保存）

### タブ構成

データビューアは`ZeroCodeEditor`のメインタブ「データビューアー」として統合されています。

#### メインタブ

- **ページ管理**: ページ編集機能
- **パーツ管理**: パーツ管理機能
- **画像管理**: 画像管理機能
- **データビューアー**: データ表示・コピー機能

#### データビューア内部タブ

- **ページ**: ページデータを表示
- **パーツ**: パーツデータを表示
- **画像**: 画像データを表示

#### フォーマット/カテゴリタブ

- **ページタブ選択時**: JSON / HTML 切り替え
- **パーツ/画像タブ選択時**: 共通 / 個別 切り替え

### 表示モード

- **JSON**: データ構造をJSON形式で表示（全タブで利用可能）
- **HTML**: 生成されたHTMLを表示（ページタブのみ、`zcode`属性は削除され、インデントされる）

### 保存機能

データビューアタブがアクティブな時に保存ボタンを押すと、現在選択されている内部タブとカテゴリに応じて適切なターゲットで`save-request`イベントが発火されます。

**ターゲットの決定**:

- `internalActiveTab === 'page'` → `targets = ['page', 'images-common', 'images-individual']`
- `internalActiveTab === 'parts'` + `activeCategory === 'common'` → `targets = ['parts-common', 'parts-common-css']`
- `internalActiveTab === 'parts'` + `activeCategory === 'individual'` → `targets = ['parts-individual', 'parts-individual-css']`
- `internalActiveTab === 'parts'` + `activeCategory === 'special'` → `targets = ['parts-special', 'parts-special-css']`
- `internalActiveTab === 'images'` + `activeCategory === 'common'` → `targets = ['images-common']`
- `internalActiveTab === 'images'` + `activeCategory === 'individual'` → `targets = ['images-individual']`

**イベント**:

- `save-request`: 保存リクエストイベント（`common.js`で処理）
  - `detail.requestId`: リクエストID
  - `detail.source`: 送信元（`'cms'` または `'editor'`）
  - `detail.targets`: 保存対象の配列（複数のターゲットが含まれる場合がある）
  - `detail.timestamp`: タイムスタンプ

## スタイリング

### CSSクラスプレフィックス

すべてのCSSクラスは`zcode-`プレフィックスを使用します。

**主要なクラス**:

- `.zcode-cms-container`: CMSコンテナ
- `.zcode-dev-container`: エディターコンテナ
- `.zcode-dev-padding`: 編集パネル分の右余白を追加（`devRightPadding`設定で有効化）
- `.zcode-toolbar`: ツールバー
- `.zcode-edit-panel`: 編集パネル
- `.zcode-add-panel`: 追加パネル
- `.zcode-delete-panel`: 削除パネル
- `.zcode-reorder-panel`: 並べ替えパネル
- `.zcode-settings-panel`: 設定パネル
- `.zcode-panels-wrapper`: パネルラッパー（`position: sticky`）

## 依存関係

### 主要な依存関係

- **Vue 3**: UIフレームワーク
- **Monaco Editor**: コードエディター
- **TipTap**: リッチテキストエディター
- **lucide-vue-next**: アイコンライブラリ

### 開発依存関係

- **TypeScript**: 型安全性
- **Vite**: ビルドツール
- **Vitest**: テストフレームワーク

## ビルドとデプロイ

### 開発

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### 型チェック

```bash
npm run type-check
```

### リント

```bash
npm run lint
```

## ブラウザサポート

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## ライセンス

MIT License

---

**最終更新日**: 2025年1月
