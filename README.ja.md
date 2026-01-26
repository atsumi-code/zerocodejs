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
- **高速**: Vue 3とViteによる高速な開発体験

## インストール

```bash
npm install zerocodejs
```

ZeroCode.jsは内部でVue 3を使用しています。npm 7以降では、peer dependenciesが自動的にインストールされるため、`npm install zerocodejs`だけでVueも一緒にインストールされます。

> **注意:** npm 6以前を使用している場合は、明示的に`npm install zerocodejs vue`を実行してください。

## クイックスタート

### 基本的な使用例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ZeroCode.js Example</title>
  <link rel="stylesheet" href="node_modules/zerocodejs/dist/zerocodejs.css">
</head>
<body>
  <zcode-cms id="cms" locale="ja">
    <link slot="css" rel="stylesheet" href="/css/common.css" />
    <script slot="script" src="/js/accordion.js"></script>
  </zcode-cms>

  <script type="module">
    import 'zerocodejs';
    
    const cms = document.getElementById('cms');
    cms.setAttribute('page', JSON.stringify([]));
    cms.setAttribute('parts-common', JSON.stringify([]));
    cms.setAttribute('parts-individual', JSON.stringify([]));
    cms.setAttribute('parts-special', JSON.stringify([]));
    cms.setAttribute('images-common', JSON.stringify([]));
    cms.setAttribute('images-individual', JSON.stringify([]));
    cms.setAttribute('images-special', JSON.stringify([]));
  </script>
</body>
</html>
```

### Reactでの使用例

```bash
npm install zerocodejs
```

```jsx
import { useEffect } from 'react';
import 'zerocodejs';
import 'zerocodejs/style.css';

function App() {
  useEffect(() => {
    const cms = document.getElementById('cms');
    if (cms) {
      cms.setAttribute('page', JSON.stringify([]));
      cms.setAttribute('parts-common', JSON.stringify([]));
      cms.setAttribute('parts-individual', JSON.stringify([]));
      cms.setAttribute('parts-special', JSON.stringify([]));
      cms.setAttribute('images-common', JSON.stringify([]));
      cms.setAttribute('images-individual', JSON.stringify([]));
      cms.setAttribute('images-special', JSON.stringify([]));
    }
  }, []);

  return <zcode-cms id="cms" locale="ja" />;
}
```

### Vueでの使用例

```bash
npm install zerocodejs
# Vueは既にインストール済み
```

```vue
<template>
  <zcode-cms id="cms" locale="ja" />
</template>

<script setup>
import 'zerocodejs';
import 'zerocodejs/style.css';
</script>
```

### エンジニア用管理画面

```html
<zcode-editor id="editor" locale="ja">
  <link slot="css" rel="stylesheet" href="/css/common.css" />
  <script slot="script" src="/js/accordion.js"></script>
</zcode-editor>
```

### CDN経由で使用する場合

```html
<!-- Vueを先に読み込む -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<!-- ZeroCode.jsを読み込む -->
<script src="https://unpkg.com/zerocodejs/dist/zerocode.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/zerocodejs/dist/zerocodejs.css">
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
