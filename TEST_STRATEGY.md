# ZeroCode.js テスト戦略

> **このファイルの目的**: ZeroCode.jsのテストコードの観点、戦略、カバレッジをまとめたドキュメントです。

## 📑 目次

- [テストの目的](#テストの目的)
- [テストの種類](#テストの種類)
- [テストの優先順位](#テストの優先順位)
- [テスト観点](#テスト観点)
- [テストカバレッジ](#テストカバレッジ)
- [テストファイル構成](#テストファイル構成)
- [テスト実行方法](#テスト実行方法)
- [今後の拡張予定](#今後の拡張予定)

## テストの目的

ZeroCode.jsのテストコードは、以下の目的で実装されています：

1. **回帰テスト**: 既存機能が新機能追加やリファクタリングで壊れないことを保証
2. **仕様の明確化**: テストコードが仕様のドキュメントとして機能
3. **リファクタリングの安全性**: コード変更時の動作保証
4. **バグの早期発見**: エッジケースや境界値のテストによる問題の早期発見

## テストの種類

### ユニットテスト（Unit Tests）

各関数を単体でテストし、以下の観点で検証：

- **正常系**: 期待通りの入力に対する期待通りの出力
- **異常系**: エラーケースや無効な入力の処理
- **エッジケース**: 境界値、空値、null/undefinedの処理
- **型安全性**: TypeScriptの型チェックと実行時の型処理

### 統合テスト（Integration Tests）

複数の関数の連携をテスト：

- テンプレート処理の一連の流れ
- データの読み込みからレンダリングまでの処理
- コンポーネント初期化とフィールド抽出の連携

## テストの優先順位

### Phase 1: コアユーティリティ（最優先）✅

**対象**: テンプレート処理の中核機能

- **field-extractor.ts**: フィールド抽出ロジック
  - テンプレート記法の解析
  - バリデーション記法の解析
  - オプショナルフィールドの識別
  - グループ化フィールドの識別

- **template-processor.ts**: テンプレート処理
  - 変数展開
  - 条件分岐処理（z-if, z-empty）
  - ループ処理（z-for）
  - タグの動的変更（z-tag）
  - スロット処理（z-slot）

- **template-utils.ts**: テンプレート関連ユーティリティ
  - バックエンドデータの解決
  - URLプレースホルダーの展開
  - 画像フィールドの処理
  - 属性の注入

### Phase 2: データ操作ユーティリティ ✅

**対象**: データの操作と検証

- **path-utils.ts**: パス操作
  - コンポーネントの取得
  - 親パスの取得
  - ID生成
  - パーツ検索

- **component-initializer.ts**: コンポーネント初期化
  - フィールドの自動初期化
  - デフォルト値の設定
  - スロット内の再帰的処理

- **validation.ts**: データ検証
  - データ構造の検証
  - 必須フィールドのチェック

- **image-utils.ts**: 画像操作
  - 画像参照の検索
  - スロット内の再帰的検索

- **storage.ts**: ストレージ操作
  - localStorage/sessionStorageの操作
  - 設定の保存・読み込み
  - エラーハンドリング

### Phase 3: コンポーザブル（未実装）

**対象**: Vueコンポーネントのロジック

- **useZeroCodeData.ts**: データ管理
- **useZeroCodeRenderer.ts**: レンダリング処理

### Phase 4: コンポーネント（未実装）

**対象**: Vueコンポーネントの統合テスト

- **ZeroCodeCMS.vue**: ユーザー用管理画面
- **ZeroCodeEditor.vue**: エンジニア用管理画面

## テスト観点

### 1. テンプレート記法の抽出

#### フィールドタイプ

- **テキストフィールド**: `{$field:default}`
  - デフォルト値の抽出
  - バリデーション記法の解析
  - グループ化フィールドの識別

- **オプショナルフィールド**: `{$field?:default}`
  - オプショナルフラグの識別
  - undefined時の動作

- **リッチテキスト**: `{$field:default:rich}`
  - HTMLタグの処理
  - 空値時の`<p></p>`生成

- **テキストエリア**: `{$field:default:textarea}`
  - 改行の処理
  - 空行の処理

- **画像フィールド**: `{$field:default:image}`
  - 画像IDからURLへの変換
  - デフォルト画像の使用

- **選択フィールド**: `($field:option1|option2)`, `($field@:option1|option2)`
  - ラジオボタン/チェックボックスの識別
  - セレクトボックスの識別
  - 複数選択の識別

#### 特殊属性

- **z-if**: 条件分岐
  - true/false/undefined/null/空文字列の処理
  - 要素の削除

- **z-empty**: 空値時の要素削除
  - undefined/null/空文字列/空リッチテキストの判定
  - 要素の削除

- **z-tag**: タグの動的変更
  - 選択肢の指定
  - デフォルトタグ名の使用
  - 有効なタグ名の検証

- **z-for**: ループ処理
  - バックエンドデータの配列をループ
  - ネストされたループ

- **z-slot**: スロット処理
  - 子コンポーネントの挿入

### 2. バリデーション記法

- **required**: 必須フィールド
- **max=N**: 最大文字数
- **readonly**: 読み取り専用
- **disabled**: 無効化
- **複数指定**: `{$field:default:required:max=50}`

### 3. バックエンドデータ

- **基本参照**: `{@fieldName}`
- **ネスト参照**: `{@user.name}`, `{@user.profile.city}`
- **配列参照**: `{@items[0]}`, `{@items[0].name}`
- **配列のlength**: `{@items.length}`
- **エラーハンドリング**: 存在しないパス、null/undefined値

### 4. URLプレースホルダー

- **基本展開**: `/shop/{shop_id}/products`
- **複数プレースホルダー**: `/user/{user_id}/shop/{shop_id}`
- **存在しない値**: プレースホルダーをそのまま残す
- **null/undefined値**: プレースホルダーをそのまま残す

### 5. データ操作

#### パス操作

- **コンポーネント取得**: `getComponentByPath(path, cmsData)`
  - 単純なパス: `page.0`
  - ネストされたパス: `page.0.slots.content.0`
  - 無効なパス: nullを返す

- **親パス取得**: `getParentPath(path)`
  - トップレベル: nullを返す
  - スロット内: 適切な親パスを返す
  - ネストされたスロット: 正しい親パスを返す

- **ID生成**: `generateId()`
  - 一意性の保証
  - フォーマットの検証

#### コンポーネント初期化

- **フィールドの自動初期化**
  - 不足フィールドの追加
  - デフォルト値の設定
  - オプショナルフィールドのスキップ

- **型別のデフォルト値**
  - text/textarea: 空文字列
  - rich: `<p></p>`
  - radio/select: 最初の選択肢
  - checkbox/select-multiple: 空配列
  - boolean: true
  - image: 空文字列

- **再帰的処理**
  - スロット内の子コンポーネントも初期化
  - ネストされたスロットの処理

#### データ検証

- **構造チェック**
  - page配列の存在
  - 各コンポーネントの必須フィールド（id, part_id）

- **エラーハンドリング**
  - null/undefinedデータ
  - 無効なデータ構造

#### 画像操作

- **画像参照の検索**
  - フィールド名に"image"を含むフィールドを検索
  - スロット内の再帰的検索
  - パスの生成

#### ストレージ操作

- **localStorage操作**
  - 設定の保存・読み込み
  - マージ処理
  - エラーハンドリング

- **sessionStorage操作**
  - セッション設定の保存・読み込み

### 6. エッジケース

#### 空値・null・undefined

- 空文字列の処理
- null値の処理
- undefined値の処理
- 空配列の処理
- 空オブジェクトの処理

#### 無効な入力

- 無効なテンプレート記法
- 無効なパス
- 存在しないパーツID
- 存在しない画像ID
- 無効なJSON

#### 境界値

- 配列の最初/最後の要素
- 最大文字数の境界
- 空の選択肢配列

## テストカバレッジ

### 現在のカバレッジ

- **Phase 1（コアユーティリティ）**: ✅ 完了
  - field-extractor: 32テスト
  - template-utils: 36テスト
  - template-processor: 28テスト

- **Phase 2（データ操作ユーティリティ）**: ✅ 完了
  - path-utils: 25テスト
  - validation: 9テスト
  - image-utils: 8テスト
  - storage: 25テスト
  - component-initializer: 10テスト

**合計**: 173テスト（すべて通過）

### カバレッジ目標

- **コアユーティリティ**: 90%以上
- **データ操作ユーティリティ**: 80%以上
- **コンポーザブル**: 70%以上
- **コンポーネント**: 60%以上

## テストファイル構成

```
src/
├── __tests__/
│   └── fixtures/
│       ├── sample-data.ts          # テスト用データ
│       └── sample-templates.ts      # テスト用テンプレート
├── core/
│   └── utils/
│       ├── field-extractor.test.ts
│       ├── template-processor.test.ts
│       ├── template-utils.test.ts
│       ├── path-utils.test.ts
│       ├── component-initializer.test.ts
│       ├── validation.test.ts
│       ├── image-utils.test.ts
│       └── storage.test.ts
└── ...
```

## テスト実行方法

### すべてのテストを実行

```bash
npm test
```

### テストを一度だけ実行（ウォッチモードを無効化）

```bash
npm test -- --run
```

### カバレッジレポートを生成

```bash
npm run test:coverage
```

### テストUIを起動

```bash
npm run test:ui
```

### 特定のテストファイルのみ実行

```bash
npm test -- field-extractor
```

## テストの書き方

### 基本的な構造

```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from './module';

describe('functionToTest', () => {
  it('should do something', () => {
    const result = functionToTest(input);
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    const result = functionToTest(null);
    expect(result).toBeNull();
  });
});
```

### フィクスチャデータの使用

```typescript
import { sampleComponentData, sampleZeroCodeData } from '../../__tests__/fixtures/sample-data';
import { sampleTemplates } from '../../__tests__/fixtures/sample-templates';

it('should process template', () => {
  const result = processTemplate(sampleTemplates.simpleText, sampleComponentData);
  expect(result).toContain('expected');
});
```

### モックの使用

```typescript
import { vi } from 'vitest';

const mockFunction = vi.fn();
const result = functionUnderTest(mockFunction);
expect(mockFunction).toHaveBeenCalled();
```

## 今後の拡張予定

### Phase 3: コンポーザブルのテスト

- **useZeroCodeData.ts**
  - データの読み込み
  - データの取得・設定
  - リアクティビティのテスト

- **useZeroCodeRenderer.ts**
  - レンダリング処理
  - エディタ属性の有効/無効
  - 画像の処理

### Phase 4: コンポーネントのテスト

- **ZeroCodeCMS.vue**
  - コンポーネントのマウント
  - イベントの発火
  - ユーザーインタラクション

- **ZeroCodeEditor.vue**
  - モード切り替え
  - パネルの表示/非表示
  - 保存処理

### Phase 5: E2Eテスト（検討中）

- ブラウザでの実際の動作確認
- ユーザーシナリオのテスト

## テストのベストプラクティス

### 1. テストの独立性

各テストは独立して実行可能であること。テスト間で状態を共有しない。

### 2. 明確なテスト名

テスト名は「何をテストしているか」が明確に分かるようにする。

```typescript
// ❌ 悪い例
it('test 1', () => { ... });

// ✅ 良い例
it('should return default value when field is undefined', () => { ... });
```

### 3. 1つのテストで1つのことをテスト

1つのテストで複数の観点をテストしない。

### 4. エッジケースのテスト

正常系だけでなく、異常系やエッジケースもテストする。

### 5. モックの適切な使用

外部依存（localStorage、DOM APIなど）は適切にモックする。

### 6. テストデータの再利用

フィクスチャデータを活用して、テストデータを一元管理する。

## トラブルシューティング

### テストが失敗する場合

1. **実装の確認**: 実装が期待通りか確認
2. **テストの期待値の確認**: テストの期待値が正しいか確認
3. **エラーメッセージの確認**: エラーメッセージから原因を特定

### テストが遅い場合

1. **不要なテストの削除**: 重複や不要なテストを削除
2. **モックの使用**: 重い処理をモックに置き換え
3. **テストの並列実行**: Vitestはデフォルトで並列実行される

### カバレッジが低い場合

1. **未テストの関数を特定**: カバレッジレポートで未テストの関数を確認
2. **エッジケースの追加**: 境界値や異常系のテストを追加
3. **統合テストの追加**: 関数間の連携をテスト

## 参考リンク

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Vue Test Utils公式ドキュメント](https://test-utils.vuejs.org/)
- [AGENTS.md](./AGENTS.md) - 開発ガイドライン
- [TECHNICAL_SPECIFICATION.md](./TECHNICAL_SPECIFICATION.md) - 技術仕様

---

**最終更新日**: 2025年1月
