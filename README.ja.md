# ZeroCode.js

[![npm](https://img.shields.io/npm/v/zerocodejs)](https://www.npmjs.com/package/zerocodejs)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/website?down_message=offline&label=Demo&up_message=online&url=https%3A%2F%2Fatsumi-code.github.io%2Fzerocodejs%2F)](https://atsumi-code.github.io/zerocodejs/)

🌐 [English](./README.md)

フレームワーク非依存のWeb ComponentsベースのCMSエディターライブラリ

> **Status: Beta**
>
> ZeroCode.js は現在ベータ版です。仕様・API・データ形式は予告なく変更される可能性があります（破壊的変更を含む）。
> 不具合報告・改善提案・ユースケース共有・ドキュメントのズレの指摘を歓迎します。
>
> - **GitHub**: https://github.com/atsumi-code/zerocodejs
> - **Issue**: [https://github.com/atsumi-code/zerocodejs/issues](https://github.com/atsumi-code/zerocodejs/issues)
> - **Discussion**: [https://github.com/atsumi-code/zerocodejs/discussions](https://github.com/atsumi-code/zerocodejs/discussions)（運用していない場合は Issue でOK）
> - **Contributing**: [./CONTRIBUTING.md](./CONTRIBUTING.md)

> ⭐ **スターをお願いします**  
> このプロジェクトに共感していただけたら、[GitHub でスター](https://github.com/atsumi-code/zerocodejs)をいただけると励みになります。

## 特徴

- **フレームワーク非依存**: Web Componentsとして実装されているため、どのフレームワークでも使用可能
- **視覚的編集**: クリック操作でコンテンツを編集・追加・削除・並べ替え
- **パーツ管理**: 再利用可能なパーツを作成・管理
- **画像管理**: 画像のアップロード・管理機能
- **柔軟なテンプレート**: カスタムHTMLテンプレート構文で動的なコンテンツを定義
- **軽量**: gzip後 約260KB

## デモ

**ライブデモ:** https://atsumi-code.github.io/zerocodejs/

## クイックスタート

### CDN（最も簡単）

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/zerocodejs/dist/zerocodejs.css">
</head>
<body>
  <zcode-editor></zcode-editor>

  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/zerocodejs/dist/zerocode.umd.js"></script>
</body>
</html>
```

これだけです！ブラウザでファイルを開いて、パーツの作成を始めましょう。

### npm

```bash
npm install zerocodejs
```

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/zerocodejs/dist/zerocodejs.css">
</head>
<body>
  <zcode-editor></zcode-editor>

  <script type="module">
    import 'zerocodejs';
  </script>
</body>
</html>
```

### React

```jsx
import 'zerocodejs';
import 'zerocodejs/style.css';

function App() {
  return <zcode-editor />;
}
```

### Vue

```vue
<template>
  <zcode-editor />
</template>

<script setup>
import 'zerocodejs';
import 'zerocodejs/style.css';
</script>
```

## コンポーネント

### `<zcode-editor>`

エンジニア・デザイナー向けエディター。パーツ管理、画像管理、データビューアを含む全機能が利用可能。**はじめての方におすすめ。**

```html
<zcode-editor></zcode-editor>
```

### `<zcode-cms>`

エンドユーザー向けCMSエディター。編集・追加・削除・並べ替えのみ（パーツ管理・画像管理なし）。

```html
<zcode-cms></zcode-cms>
```

## 既存データの読み込み

既存データを読み込む場合は、JavaScriptで属性を設定します：

```javascript
const editor = document.querySelector('zcode-editor');
editor.setAttribute('page', JSON.stringify(pageData));
editor.setAttribute('parts-common', JSON.stringify(partsData));
// ... 必要に応じて他の属性も設定
```

## ドキュメント

- [技術仕様書](./TECHNICAL_SPECIFICATION.md)
- [実装TODO](./TODO.md)
- [AI向けガイドライン](./AGENTS.md)

## 日本語コミュニティ

- GitHub Issues での日本語での質問・議論を歓迎します
- Issue は日本語でも英語でもOKです
- PR のコミットメッセージは英語推奨ですが、日本語の説明も歓迎します

## セキュリティ

ZeroCode.jsはフロントエンドライブラリのため、クライアント側での完全なセキュリティ保証はできません。

### 推奨事項

- **サーバー側での検証を必須とする**: データ保存前にサーバー側で検証してください
- **認証・認可の実装**: パーツデータの変更は認証されたユーザーのみ許可してください
- **送信元の検証**: `save-request`イベントの`source`フィールドを確認してください
- **パーツテンプレートの管理**: パーツテンプレートは信頼できるソースからのみ使用してください

詳細は[技術仕様書](./TECHNICAL_SPECIFICATION.md)のセキュリティセクションを参照してください。

## ライセンス

MIT License

---

**最終更新日**: 2025年1月
