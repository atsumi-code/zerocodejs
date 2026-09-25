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

### Ways to Contribute Without Coding

- **Documentation**: Fix typos, improve wording, or suggest clearer explanations (Issue or PR)
- **Feedback**: Report what was confusing or where you got stuck when using ZeroCode.js (Issue or Discussions)
- **Translation / Wording**: Suggest better phrasing in English or Japanese for README, docs, or UI
- **Spread the word**: Share the project (blog, SNS, sample sites). We appreciate it!

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

After `npm ci` or `npm install`, [Husky](https://github.com/typicode/husky) sets up a `pre-commit` hook. On `git commit`, [lint-staged](https://github.com/lint-staged/lint-staged) runs ESLint (`--fix`) and Prettier on staged files (see `package.json`). Manual checks: `npm run lint`, `npm run format:check`.

### Pull Requests

- Small, focused PRs are appreciated
- Please describe the reason for the change and the scope of impact (breaking changes)
- If documentation changes are needed, please update `docs.html` / `TECHNICAL_SPECIFICATION.md` together

### Releasing a Beta (Maintainers)

```bash
# 0. Start from the latest main and reinstall dependencies from the lockfile
git checkout main
git pull
rm -rf node_modules && npm ci

# 1. (Optional) Rename the "Unreleased" heading in CHANGELOG.md to the new version, then commit it
#    npm version requires a clean working tree

# 2. Bump the version (-beta.N → -beta.N+1). This also creates a git commit and tag
npm version prerelease --preid=beta

# 3. Publish with the beta tag (prepublishOnly runs verify:deps and build automatically)
npm login
npm publish --tag beta

# 4. Push the version commit and tag
git push --follow-tags

# 5. Point latest to the new version as well
npm dist-tag add zerocodejs@$(node -p "require('./package.json').version") latest

# 6. Check
npm dist-tag ls zerocodejs
```

- Always run `git pull` and `npm ci` first. `npm publish` ships whatever is in `dist/` and `node_modules/` at that moment
- If `npm publish` stops with `invalid: ...`, your `node_modules` does not match `package.json`. Run `rm -rf node_modules && npm ci` and retry
- If a broken version was published, publish a fixed version and deprecate the broken one: `npm deprecate zerocodejs@<version> "<reason>"` (npm does not allow republishing the same version)

---

## 日本語

### まず最初に（ベータ版について）

ZeroCode.js はベータ版です。仕様・API・データ形式は変更される可能性があります（破壊的変更を含む）。

### 相談・質問・提案（おすすめ）

- まずは Issue でOKです（質問でも可）
- 「仕様としてどうあるべきか」の相談も歓迎します

### コードを書かずに貢献する方法

- **ドキュメント**: 誤字修正、表現の改善、わかりやすい説明の提案（Issue または PR）
- **フィードバック**: 使っていて分かりづらかった点・困った点の報告（Issue または Discussions）
- **翻訳・表現**: README やドキュメント・UI の英語・日本語の言い回し提案
- **紹介**: ブログや SNS での紹介、サンプルサイトの共有。歓迎します

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

`npm ci` / `npm install` 後、[Husky](https://github.com/typicode/husky) が `pre-commit` を有効にします。`git commit` 時に [lint-staged](https://github.com/lint-staged/lint-staged) がステージしたファイルに対して ESLint（`--fix`）と Prettier を実行します（設定は `package.json`）。手動確認: `npm run lint` / `npm run format:check`。

### Pull Request

- 小さく分けたPRが嬉しいです
- 変更理由と影響範囲（破壊的変更の有無）を書いてください
- ドキュメント変更を伴う場合は、`docs.html` / `TECHNICAL_SPECIFICATION.md` も同時に更新してください

### ベータ版のリリース（メンテナー向け）

```bash
# 0. 最新の main にして、依存を lockfile どおりに入れ直す
git checkout main
git pull
rm -rf node_modules && npm ci

# 1. （任意）CHANGELOG.md の「未リリース」の見出しを新しいバージョンに書き換えてコミットする
#    npm version は作業ツリーがクリーンでないと実行できない

# 2. バージョンを上げる（-beta.N → -beta.N+1）。Git のコミットとタグも自動で作られる
npm version prerelease --preid=beta

# 3. ベータタグで公開（prepublishOnly で verify:deps とビルドが自動実行される）
npm login
npm publish --tag beta

# 4. バージョンのコミットとタグを push する
git push --follow-tags

# 5. latest も新しいバージョンに合わせる
npm dist-tag add zerocodejs@$(node -p "require('./package.json').version") latest

# 6. 確認
npm dist-tag ls zerocodejs
```

- `git pull` と `npm ci` は必ず最初に実行する。`npm publish` はその時点の `dist/` と `node_modules/` の中身をそのまま公開する
- `npm publish` が `invalid: ...` で止まった場合は、`node_modules` が `package.json` と一致していない。`rm -rf node_modules && npm ci` を実行してからやり直す
- 問題のある版を公開してしまった場合は、修正版を公開したうえで問題の版を非推奨にする: `npm deprecate zerocodejs@<バージョン> "<理由>"`（npm では同じバージョンを再公開できない）
