# デプロイガイド

MoteTalkプロジェクトの本番環境への展開手順です。

## 🚀 Renderでのデプロイ

### 1. 前提条件

- GitHubリポジトリが準備済み
- Renderアカウントが作成済み
- 必要なAPIキーが取得済み

### 2. Renderでのサービス作成

#### 2.1 新しいWebサービスを作成

1. [Render Dashboard](https://dashboard.render.com/)にアクセス
2. 「New +」→「Web Service」を選択
3. GitHubリポジトリを接続

#### 2.2 基本設定

| 項目 | 値 | 説明 |
|------|----|----|
| **Name** | motetalk-app | サービス名 |
| **Environment** | Node | ランタイム環境 |
| **Region** | Oregon (US West) | リージョン（推奨） |
| **Branch** | main | デプロイするブランチ |

#### 2.3 ビルド設定

| 項目 | 値 | 説明 |
|------|----|----|
| **Build Command** | `npm install && npm run build` | ビルドコマンド |
| **Start Command** | `node server/index.js` | 起動コマンド |

**設定の説明:**
- **Build Command**: 依存関係のインストールとフロントエンドのビルド
- **Start Command**: Express.jsサーバーの起動（フロントエンドとバックエンドを統合配信）

### 3. 環境変数の設定

Renderダッシュボードの「Environment」タブで以下を設定：

#### 3.1 必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|----|
| `NODE_ENV` | 環境設定 | `production` |
| `STRIPE_SECRET_KEY` | Stripe秘密キー | `sk_test_...` |
| `FIREBASE_PROJECT_ID` | FirebaseプロジェクトID | `mote-talk-bbce1` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin用メール | `firebase-adminsdk-...` |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin用秘密キー | `-----BEGIN PRIVATE KEY-----...` |

#### 3.2 フロントエンド用環境変数

| 変数名 | 説明 | 例 |
|--------|------|----|
| `VITE_GEMINI_API_KEY` | Gemini APIキー | `AIzaSy...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe公開キー | `pk_test_...` |
| `VITE_FIREBASE_API_KEY` | Firebase APIキー | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase認証ドメイン | `mote-talk-bbce1.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | FirebaseプロジェクトID | `mote-talk-bbce1` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebaseストレージバケット | `mote-talk-bbce1.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebaseメッセージング送信者ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | FirebaseアプリID | `1:123456789:web:...` |
| `VITE_APP_URL` | アプリケーションURL | `https://motetalk-0723.onrender.com` |

### 4. デプロイ設定

#### 4.1 自動デプロイ

- **Auto-Deploy**: 有効
- **Branch**: main
- **Build Filter**: デフォルト

#### 4.2 ヘルスチェック

- **Health Check Path**: `/api/health`
- **Health Check Timeout**: 180秒

### 5. デプロイの実行

1. 「Create Web Service」をクリック
2. 初回ビルドが開始される（5-10分程度）
3. ビルド完了後、サービスが起動

## 🔧 デプロイ後の確認

### 1. 基本動作確認

#### フロントエンド
- アプリケーションが正常に表示される
- 静的ファイル（CSS/JS）が正しく読み込まれる
- ファビコンが表示される

#### バックエンド
```bash
# ヘルスチェック
curl https://your-app-name.onrender.com/api/health
# 期待結果: {"status":"OK"}
```

### 2. 機能確認

#### 認証機能
- Googleログインが動作する
- ユーザー情報が正しく表示される

#### AI機能
- メッセージ入力でAI返信が生成される
- 会話履歴が正しく保存される

#### 決済機能
- Stripe決済ページが表示される
- テスト決済が正常に完了する

## 🚨 トラブルシューティング

### よくある問題

#### 1. ビルドエラー

**症状**: ビルドが失敗する
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

**解決策**:
1. `package.json`の依存関係を確認
2. Node.jsバージョンを確認（18.x以上推奨）
3. 環境変数が正しく設定されているか確認

#### 2. 静的ファイル配信エラー

**症状**: CSS/JSファイルが404エラー
```
GET https://motetalk-0723.onrender.com/index-xxx.css 404 (Not Found)
```

**解決策**:
1. ビルドが正常に完了しているか確認
2. `dist`フォルダが生成されているか確認
3. 静的ファイル配信の設定を確認

#### 3. 環境変数エラー

**症状**: アプリケーションが起動しない
```
Error: Cannot find module 'firebase-admin'
```

**解決策**:
1. 環境変数が正しく設定されているか確認
2. 必須の環境変数が不足していないか確認
3. 値に特殊文字が含まれていないか確認

#### 4. パフォーマンス問題

**症状**: 初回読み込みが遅い
```
First Contentful Paint: 5.2s
```

**解決策**:
1. バンドルサイズの最適化
2. 画像の圧縮
3. CDNの活用

## 📊 監視とメンテナンス

### 1. ログ監視

#### Renderログの確認
1. Renderダッシュボードでサービスを選択
2. 「Logs」タブでログを確認
3. エラーログを定期的にチェック

#### アプリケーションログ
```javascript
// 構造化ログの出力
console.log('🚀 Server running on port', PORT);
console.log('📁 Frontend served from:', path.join(__dirname, '../dist'));
console.log('🔧 Environment:', process.env.NODE_ENV);
```

### 2. パフォーマンス監視

#### メトリクス収集
- レスポンス時間
- エラー率
- メモリ使用量
- CPU使用率

#### アラート設定
- エラー率が5%を超えた場合
- レスポンス時間が3秒を超えた場合
- メモリ使用量が80%を超えた場合

### 3. セキュリティ監視

#### セキュリティチェック
- 依存関係の脆弱性スキャン
- 環境変数の漏洩チェック
- APIキーの有効性確認

## 🔄 継続的デプロイ

### 1. GitHub Actions

#### ワークフロー設定
```yaml
name: Deploy to Render
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v1.0.0
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### 2. デプロイ戦略

#### Blue-Green Deployment
1. 新しいバージョンを別環境にデプロイ
2. テスト完了後、トラフィックを切り替え
3. 旧環境を削除

#### Rolling Deployment
1. 段階的にインスタンスを更新
2. ダウンタイムを最小化
3. ロールバックが容易

## 📈 スケーリング

### 1. 水平スケーリング

#### 複数インスタンス
- ロードバランサーの設定
- セッション共有の設定
- データベース接続プールの調整

### 2. 垂直スケーリング

#### リソース増強
- CPU/メモリの増加
- ストレージ容量の拡張
- ネットワーク帯域の向上

## 🔒 セキュリティ

### 1. 環境変数の管理

#### 暗号化
- 機密情報は暗号化して保存
- アクセス権限の制限
- 定期的なローテーション

### 2. ネットワークセキュリティ

#### HTTPS強制
```javascript
// HTTPSリダイレクト
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### 3. セキュリティヘッダー

```javascript
// セキュリティヘッダーの設定
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));
```

## 📚 参考資料

- [Render Documentation](https://render.com/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practices-security.html)
- [Firebase Hosting](https://firebase.google.com/docs/hosting) 