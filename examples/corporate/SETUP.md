# コーポレート事例 — 準備（Docker / Composer / Laravel）

このドキュメントでは、コーポレート事例を動かすための環境構築手順をまとめます。**Docker がまだの場合は、まず 1 から順に進めてください。**

---

## 1. Docker / Docker Compose のインストール（未導入の場合）

コーポレート事例では、PHP・MySQL・Nginx を **Docker** で動かします。Docker を入れると、ホストに PHP や MySQL を直接入れなくてもコンテナ内で実行できます。

- **Docker** … コンテナでアプリや DB を動かすツール
- **Docker Compose** … 複数コンテナ（PHP + MySQL + Nginx）を一括で起動するツール（最近の Docker には同梱されています）

### Mac

1. [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) を開く
2. 「Download」から自分のチップに合わせて **Apple Silicon** または **Intel** を選んでダウンロード
3. インストーラーを実行し、指示に従ってインストール
4. アプリから Docker Desktop を起動し、メニューバーに Docker のアイコンが出れば起動済み

### Windows

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) を開く
2. 「Download」でインストーラーをダウンロード
3. インストーラーを実行。WSL 2 の導入を促された場合は、表示される手順に従う
4. インストール後、Docker Desktop を起動

### Linux（Ubuntu 例）

```bash
# Docker の公式リポジトリを追加
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engine と Compose プラグインをインストール
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

- 他のディストリビューションは [Docker 公式: Install Docker Engine](https://docs.docker.com/engine/install/) を参照

### インストール確認

ターミナルで次を実行し、バージョンが表示されれば OK です。

```bash
docker --version
docker compose version
```

---

## 2. 環境変数（任意）

`examples/corporate/` に `.env` を置くと docker-compose で読み込まれます。未作成の場合は既定値を使用します。

```bash
cd examples/corporate
cp .env.example .env
# 必要なら .env の APP_PORT, DB_PORT, DB_PASSWORD などを編集
```

| 変数 | 既定値 | 説明 |
|------|--------|------|
| APP_PORT | 8080 | ブラウザでアクセスするポート（http://localhost:8080） |
| DB_PORT | 33060 | ホストから MySQL に接続する場合のポート |
| PMA_PORT | 8081 | phpMyAdmin のポート（http://localhost:8081） |
| DB_DATABASE | zerocode_corporate | DB 名 |
| DB_USERNAME | zerocode | DB ユーザー |
| DB_PASSWORD | secret | DB パスワード |

---

## 3. Laravel プロジェクトの作成（src/）

Laravel を `src/` に作成します。**初回のみ**実行します。

### 方法 A: Docker 内で Composer を実行（推奨）

`docker-compose.yml` では `./src` がコンテナの `/var/www/html` にマウントされています。**ホストの `src/` が空**（または .gitkeep のみ）の状態で実行します。

```bash
cd examples/corporate
# src/ が無い場合は mkdir -p src
docker compose run --rm app composer create-project laravel/laravel . --no-interaction
```

- コンテナ内のカレントディレクトリは `/var/www/html`（= ホストの `src/`）なので、このコマンドで `src/` に Laravel 一式が作成されます。
- 既に `src/` にファイルがある場合は、別の場所に退避するか、方法 B でホストから `src` を指定して作成してください。

### 方法 B: ホストに Composer がある場合

```bash
cd examples/corporate
composer create-project laravel/laravel src --no-interaction
```

---

## 4. Laravel の .env を用意

```bash
cd examples/corporate/src
cp .env.example .env
php artisan key:generate
```

`.env` の DB 設定を、Docker の MySQL に合わせます。

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=zerocode_corporate
DB_USERNAME=zerocode
DB_PASSWORD=secret
```

- `DB_HOST=mysql` は docker-compose のサービス名です。  
- パスワードなどは、`examples/corporate/.env`（docker-compose 用）と揃えてください。

---

## 5. コンテナの起動

```bash
cd examples/corporate
docker compose up -d
```

- ブラウザで `http://localhost:8080` を開く（APP_PORT を変えた場合はそのポート）。
- **phpMyAdmin** で DB を確認する場合は `http://localhost:8081` を開く（PMA_PORT で変更可。`.env` に zerocode / secret で自動ログインされる想定）。

## 6. コーポレート用マイグレーション・シーダーの実行

コーポレート事例用のテーブル（pages, news, css, types, parts, images）を作成し、初期データを投入します。

```bash
cd examples/corporate
docker compose run --rm app php artisan migrate --force
docker compose run --rm app php artisan db:seed --force
```

- マイグレーションで `css`, `types`, `parts`, `images`, `pages`, `news` テーブルが作成されます。
- シーダーで固定ページ（default, about, services）と共通の CTA パーツ・画像が投入されます。

---

## 7. ZeroCode のビルド（管理画面で ZeroCode を使う場合）

管理画面で zcode-editor / zcode-cms を使う場合は、**リポジトリルート**で ZeroCode をビルドしてください。`docker-compose.yml` で `zerocodejs/dist` を `public/dist` にマウントしているため、ビルド後にコンテナを起動すると `/dist/zerocode.umd.js` などが参照できます。

```bash
# リポジトリルート（zerocodejs/）で
npm run build
```

---

## まとめ

| 順番 | 作業 |
|------|------|
| 1 | **Docker がまだなら** 上記「1. Docker / Docker Compose のインストール」でインストールし、`docker --version` と `docker compose version` で確認 |
| 2 | `examples/corporate/.env` を用意（任意。`cp .env.example .env`） |
| 3 | `docker compose run --rm app composer create-project laravel/laravel . --no-interaction` で `src/` に Laravel 作成 |
| 4 | `src/.env` を用意し、`APP_KEY` と DB 設定を編集 |
| 5 | `docker compose up -d` で起動 |
| 6 | `docker compose run --rm app php artisan migrate --force` と `php artisan db:seed --force` でコーポレート用テーブル・初期データ（固定ページ・新着サンプル 5 件含む）投入 |
| 7 | 管理・公開で ZeroCode を使う場合は、**リポジトリルート**で `npm run build` を実行 |
| 8 | 動作確認は [README.md](./README.md) の「動作確認」を参照 |
