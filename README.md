# 割り勘計算機 (Split Calculator)

Next.js と TypeScript で作られたスマート割り勘計算アプリです。PWA 対応でオフラインでも動作し、モバイル最適化されています。

## 機能

### ✨ MVP 機能

- **基本入力**: 合計金額・人数・サービス料/税（パーセント or 固定額）
- **分割方式**: 等分割（現在実装済み）
- **端数対応**: 1 円・10 円・100 円の丸め、残差を自動吸収
- **結果共有**: Web Share API（ネイティブ共有）、Clipboard API（コピー）
- **ローカル保存**: localStorage による設定の自動保存・復元
- **PWA 対応**: manifest.json + Service Worker によるオフライン動作
- **UI/UX**: モバイル最適化（numeric input モード、レスポンシブデザイン）

### 🔮 将来実装予定

- 比率入力分割
- 各人手入力分割
- アイテム別割り当て分割
- QR コード生成
- ダークモード
- アクセシビリティ対応の強化

## 技術スタック

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **PWA**: Service Worker + Web App Manifest

## 環境構築

### 📋 前提条件

Node.js 18.0 以上が必要です。

### 🖥️ Windows

#### Option 1: PowerShell (推奨)

```powershell
# Node.jsのインストール（chocolateyを使用）
# chocolateyがない場合は https://chocolatey.org/install からインストール
choco install nodejs

# または公式サイトからダウンロード: https://nodejs.org/

# プロジェクトのクローン
git clone <repository-url>
cd split_alculator_test

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

#### Option 2: WSL2 (Ubuntu)

```bash
# Node.jsのインストール (nvm推奨)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# プロジェクトのセットアップ
git clone <repository-url>
cd split_alculator_test
npm install
npm run dev
```

### 🐧 Linux (Ubuntu/Debian)

```bash
# Node.jsのインストール (nvm推奨)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# または apt経由
sudo apt update
sudo apt install nodejs npm

# プロジェクトのセットアップ
git clone <repository-url>
cd split_alculator_test
npm install
npm run dev
```

#### CentOS/RHEL/Fedora

```bash
# dnf/yum経由
sudo dnf install nodejs npm
# または
sudo yum install nodejs npm

# プロジェクトのセットアップ
git clone <repository-url>
cd split_alculator_test
npm install
npm run dev
```

### 🍎 macOS

#### Option 1: Homebrew (推奨)

```bash
# Homebrewのインストール (未インストールの場合)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.jsのインストール
brew install node

# プロジェクトのセットアップ
git clone <repository-url>
cd split_alculator_test
npm install
npm run dev
```

#### Option 2: nvm

```bash
# nvmのインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc  # または ~/.bash_profile

# Node.jsのインストール
nvm install 18
nvm use 18

# プロジェクトのセットアップ
git clone <repository-url>
cd split_alculator_test
npm install
npm run dev
```

## 🚀 使用方法

1. **基本設定**

   - 合計金額を入力
   - サービス料・税を設定（パーセントまたは固定額）
   - 端数処理方法を選択

2. **参加者管理**

   - 参加者名を入力
   - 「+ 参加者を追加」で参加者を増やす
   - × ボタンで参加者を削除

3. **計算・共有**
   - 「計算する」ボタンで割り勘を計算
   - 「共有」ボタンで結果をシェア

## 📱 PWA としてインストール

### モバイル (iOS/Android)

1. ブラウザでサイトにアクセス
2. ブラウザメニューから「ホーム画面に追加」を選択
3. アプリ名を確認して追加

### デスクトップ (Chrome/Edge)

1. アドレスバー右側のインストールアイコンをクリック
2. 「インストール」を選択

## 🛠️ 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# ESLintチェック
npm run lint
```

## 📁 プロジェクト構造

```
split_alculator_test/
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   │   ├── layout.tsx       # ルートレイアウト
│   │   ├── page.tsx         # メインページ
│   │   └── globals.css      # グローバルスタイル
│   ├── components/          # Reactコンポーネント
│   │   ├── ui/              # shadcn/ui基本コンポーネント
│   │   └── PWARegistration.tsx
│   ├── hooks/               # カスタムフック
│   │   └── useLocalStorage.ts
│   └── lib/                 # ユーティリティ・ロジック
│       ├── types.ts         # 型定義
│       ├── calculator.ts    # 計算ロジック
│       ├── utils.ts         # ユーティリティ関数
│       └── pwa.ts           # PWA関連機能
├── public/                  # 静的ファイル
│   ├── manifest.json        # PWAマニフェスト
│   ├── sw.js               # Service Worker
│   └── favicon.ico         # ファビコン
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🔧 トラブルシューティング

### Node.js バージョンエラー

```bash
# 現在のバージョン確認
node --version

# 18.0以上であることを確認
```

### 依存関係エラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### PWA が動作しない

- HTTPS または localhost でアクセスしているか確認
- ブラウザのキャッシュをクリア
- デベロッパーツールで Service Worker の状況を確認

### Windows PowerShell 実行ポリシーエラー

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
