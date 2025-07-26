# セットアップガイド

MoteTalkプロジェクトの開発環境構築手順です。

## 📋 前提条件

- Node.js 18.0.0以上
- npm 9.0.0以上
- Git

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/Fuki-san/motetalk-0723.git
cd motetalk-0723
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

#### ローカル開発用
`.env`ファイルを作成し、以下のAPIキーを設定してください：

```env
# Gemini API設定
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Stripe設定
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Firebase設定
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin設定（バックエンド用）
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# アプリケーション設定
VITE_APP_URL=http://localhost:5173
```

### 4. APIキーの取得方法

#### Gemini API キー
1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. 「Create API Key」をクリック
3. 生成されたキーを`VITE_GEMINI_API_KEY`に設定

#### Stripe API キー
1. [Stripe Dashboard](https://dashboard.stripe.com/apikeys)にアクセス
2. 「Publishable key」を`VITE_STRIPE_PUBLISHABLE_KEY`に設定
3. 「Secret key」を`STRIPE_SECRET_KEY`に設定

#### Firebase設定
1. [Firebase Console](https://console.firebase.google.com/)でプロジェクト作成
2. **Authentication機能を有効化**
   - 左メニュー > Authentication をクリック
   - 「始める」ボタンをクリック
3. **Googleサインインを有効化**
   - Authentication > Sign-in method タブ
   - 「Google」をクリック
   - 「有効にする」をオンにする
   - プロジェクトのサポートメール（あなたのGmailアドレス）を入力
   - 「保存」をクリック
4. **承認済みドメインを追加**
   - Authentication > Settings > 承認済みドメイン
   - `localhost` が含まれていることを確認
   - **開発環境**: WebContainer環境の場合、表示されるドメインを追加
     - 例: `*.webcontainer-api.io` または具体的なドメイン
5. プロジェクト設定 > 全般 > マイアプリ > Firebase SDK snippet > 構成
6. 表示された設定値を上記の環境変数に設定

### 5. 開発サーバーの起動

```bash
# フロントエンドのみ
npm run dev

# フルスタック開発（フロントエンド + バックエンド）
npm run dev:full
```

## 🧪 動作確認

### 1. フロントエンドの確認
- http://localhost:5173 にアクセス
- アプリケーションが正常に表示されることを確認

### 2. バックエンドの確認
- http://localhost:3001/api/health にアクセス
- `{"status":"OK"}` が返されることを確認

### 3. Firebase認証の確認
- アプリケーションでGoogleログインが動作することを確認

## 🔧 開発用スクリプト

```bash
# フロントエンド開発サーバー
npm run dev

# バックエンド開発サーバー
npm run dev:server

# フルスタック開発
npm run dev:full

# ビルド
npm run build

# 型チェック
npm run type-check

# リント
npm run lint
```

## 📁 ファイル構成

```
motetalk-cursor01-main/
├── src/                    # フロントエンド
│   ├── components/        # Reactコンポーネント
│   │   ├── Dashboard.tsx # AI返信生成画面
│   │   ├── Templates.tsx # テンプレート管理
│   │   ├── Pricing.tsx   # 料金プラン
│   │   ├── MyPage.tsx    # ユーザー設定
│   │   └── AuthModal.tsx # 認証モーダル
│   ├── services/          # API統合サービス
│   │   ├── geminiService.ts    # Gemini API統合
│   │   ├── stripeService.ts    # Stripe決済統合
│   │   ├── conversationService.ts # 会話管理
│   │   └── databaseService.ts  # データベース操作
│   ├── hooks/            # カスタムフック
│   │   ├── useAuth.ts    # 認証フック
│   │   ├── useUserData.ts # ユーザーデータフック
│   │   └── useUserSettings.ts # 設定フック
│   └── config/           # 設定ファイル
│       └── firebase.ts   # Firebase設定
├── server/               # バックエンド
│   └── index.js         # Express.jsサーバー
├── public/              # 静的ファイル
│   ├── favicon.svg      # ファビコン
│   └── sw.js           # サービスワーカー
└── docs/               # ドキュメント
```

## 🔑 環境変数一覧

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `VITE_GEMINI_API_KEY` | Gemini APIキー | ✅ |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe公開キー | ✅ |
| `STRIPE_SECRET_KEY` | Stripe秘密キー | ✅ |
| `VITE_FIREBASE_API_KEY` | Firebase APIキー | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase認証ドメイン | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | FirebaseプロジェクトID | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebaseストレージバケット | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebaseメッセージング送信者ID | ✅ |
| `VITE_FIREBASE_APP_ID` | FirebaseアプリID | ✅ |
| `FIREBASE_PROJECT_ID` | Firebase Admin用プロジェクトID | ✅ |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin用クライアントメール | ✅ |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin用秘密キー | ✅ |
| `VITE_APP_URL` | アプリケーションURL | ✅ |

## 🚨 トラブルシューティング

### よくある問題

1. **環境変数が読み込まれない**
   - `.env`ファイルが正しい場所にあることを確認
   - 変数名が`VITE_`で始まっていることを確認

2. **Firebase認証エラー**
   - 承認済みドメインに`localhost`が含まれていることを確認
   - Googleサインインが有効になっていることを確認

3. **Stripe決済エラー**
   - 公開キーと秘密キーが正しく設定されていることを確認
   - テストモードのキーを使用していることを確認

詳細なトラブルシューティングは [トラブルシューティングガイド](./TROUBLESHOOTING.md) を参照してください。 