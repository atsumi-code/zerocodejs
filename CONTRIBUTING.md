# Contributing to ZeroCode.js

We welcome contributions and feedback in both **English and Japanese**.

🇯🇵 [日本語版はこちら](#日本語)

---

## English

### Before You Start (Beta Notice)

ZeroCode.js is in beta. APIs, specifications, and data formats may change (including breaking changes).

### Questions & Discussions

- Feel free to open an Issue for questions
- Discussions about "how should this work?" are also welcome

### Bug Reports (Issue)

Please include:

- Steps to reproduce (minimal steps)
- Expected behavior
- Actual behavior
- Environment (OS / Node / Browser)
- Minimal HTML or `ZeroCodeData` if possible (remove sensitive data)

### Feature Requests (Issue)

Please include:

- Purpose (who wants to solve what)
- Alternatives considered (if any)
- Whether breaking changes are acceptable
- Compatibility with existing specs (`docs.html` / `TECHNICAL_SPECIFICATION.md`)

### Local Development

```bash
npm ci
npm run dev
```

Build check:

```bash
npm run build
```

### Pull Requests

- Small, focused PRs are appreciated
- Please describe the reason for the change and the scope of impact (breaking changes)
- If documentation changes are needed, please update `docs.html` / `TECHNICAL_SPECIFICATION.md` together

---

## 日本語

### まず最初に（ベータ版について）

ZeroCode.js はベータ版です。仕様・API・データ形式は変更される可能性があります（破壊的変更を含む）。

### 相談・質問・提案（おすすめ）

- まずは Issue でOKです（質問でも可）
- 「仕様としてどうあるべきか」の相談も歓迎します

### バグ報告（Issue）

以下があると調査が速いです。

- 再現手順（最小の手順）
- 期待する挙動
- 実際の挙動
- 環境（OS / Node / ブラウザ）
- 可能なら最小のHTMLや `ZeroCodeData`（機密は除外）

### 機能要望（Issue）

- 目的（誰が何を解決したいか）
- 代替案（あれば）
- 破壊的変更の許容可否
- 既存仕様（`docs.html` / `TECHNICAL_SPECIFICATION.md`）との整合性

### 開発（ローカル）

```bash
npm ci
npm run dev
```

ビルド確認:

```bash
npm run build
```

### Pull Request

- 小さく分けたPRが嬉しいです
- 変更理由と影響範囲（破壊的変更の有無）を書いてください
- ドキュメント変更を伴う場合は、`docs.html` / `TECHNICAL_SPECIFICATION.md` も同時に更新してください
