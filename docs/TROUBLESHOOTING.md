# トラブルシューティングガイド

MoteTalkプロジェクトでよく発生する問題とその解決策について説明します。

## 🚨 よくある問題

### 1. SPAキャッシュ問題（重要）

#### 症状
```
❌ Static file not found: /index-gfGlGWnJ.js
❌ Static file not found: /index-D4L134hE.css
Refused to apply style from '...' because its MIME type ('text/html') is not a supported stylesheet MIME type
```

#### 原因
- ブラウザが古いビルドファイル名をキャッシュしている
- HTMLファイル内のファイル名と実際のビルドファイル名が不一致
- 静的ファイル配信の設定が不適切
- Viteのハッシュ付きファイル名によるキャッシュバスティングの問題

#### 解決策

##### 1. サーバー側での動的HTML生成
```javascript
// HTMLファイルを読み込んで動的に更新
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// 現在のビルドファイルを検出
const distFiles = fs.readdirSync(path.join(__dirname, '../dist'));
const jsFile = distFiles.find(file => file.endsWith('.js') && file.startsWith('index-'));
const cssFile = distFiles.find(file => file.endsWith('.css') && file.startsWith('index-'));

if (jsFile && cssFile) {
  // HTML内のファイル名を現在のビルドファイルに置換
  htmlContent = htmlContent.replace(
    /src="\/index-[^"]+\.js"/g,
    `src="/${jsFile}"`
  );
  htmlContent = htmlContent.replace(
    /href="\/index-[^"]+\.css"/g,
    `href="/${cssFile}"`
  );
}
```

##### 2. キャッシュ制御ヘッダーの設定
```javascript
// キャッシュ制御ヘッダーを設定
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');
res.setHeader('Surrogate-Control', 'no-store');
res.setHeader('X-Content-Type-Options', 'nosniff');
```

##### 3. 静的ファイル配信の改善
```javascript
app.use(express.static(staticPath, {
  maxAge: '0',
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    // MIMEタイプとキャッシュ制御を設定
  }
}));
```

#### 根本的な解決策（重要）

##### 1. キャッシュバスティング付きHTML生成
```javascript
// キャッシュバスティング用のタイムスタンプを追加
const timestamp = Date.now();

// HTML内のファイル名を現在のビルドファイルに置換（キャッシュバスティング付き）
htmlContent = htmlContent.replace(
  /src="\/index-[^"]+\.js"/g,
  `src="/${jsFile}?v=${timestamp}"`
);
htmlContent = htmlContent.replace(
  /href="\/index-[^"]+\.css"/g,
  `href="/${cssFile}?v=${timestamp}"`
);
```

##### 2. 強力なキャッシュ制御ヘッダー
```javascript
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');
res.setHeader('Surrogate-Control', 'no-store');
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
```

##### 3. 静的ファイル配信の最適化
```javascript
// JSファイルの配信
app.use((req, res, next) => {
  if (req.path.match(/\/index-.*\.js/)) {
    console.log(`📁 Serving JS file: ${req.path}`);
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    // キャッシュ制御ヘッダーを設定
    return express.static(staticPath)(req, res, next);
  }
  next();
});

// CSSファイルの配信
app.use((req, res, next) => {
  if (req.path.match(/\/index-.*\.css/)) {
    console.log(`📁 Serving CSS file: ${req.path}`);
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    // キャッシュ制御ヘッダーを設定
    return express.static(staticPath)(req, res, next);
  }
  next();
});
```

#### 重要な学び

##### 1. 問題の真の原因
- **ブラウザキャッシュ**: 古いHTMLファイルがキャッシュされている
- **静的ファイル配信の順序**: `express.static`が動的HTML生成より先に実行される
- **path-to-regexpエラー**: ワイルドカードパス指定でエラーが発生

##### 2. 解決のポイント
- **動的HTML生成**: サーバーが現在のビルドファイルを自動検出
- **キャッシュバスティング**: タイムスタンプ付きURLでキャッシュを無効化
- **静的ファイル配信の分離**: `index.html`を除外して動的生成を優先
- **適切なMIME type設定**: 各ファイルタイプに応じたContent-Type

##### 3. デバッグの重要性
- **ローカルテスト**: プッシュ前に必ずローカルで動作確認
- **ログの活用**: 詳細なログで問題を特定
- **段階的な修正**: 一度に大きな変更を避け、小さな修正を積み重ね

#### 予防策
- 本番環境では適切なキャッシュ戦略を実装
- ビルド時にファイル名の一貫性を確保
- デプロイ後のハードリフレッシュを推奨
- 開発環境ではキャッシュを無効化
- **キャッシュバスティング付きURLを使用**
- **静的ファイル配信の順序に注意**

### 2. 静的ファイル配信エラー

### 2. path-to-regexpエラー

#### 症状
```
TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
```

#### 原因
- Express.jsの最新バージョンで`app.get('*', ...)`が正しく処理されない

#### 解決策
```javascript
// 修正前
app.get('*', (req, res) => { ... });

// 修正後
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // SPAルーティング処理
});
```

### 3. Firebase認証エラー

#### 症状
```
Firebase: Error (auth/unauthorized-domain).
```

#### 原因
- 承認済みドメインに`localhost`が含まれていない
- 開発環境のドメインが登録されていない

#### 解決策
1. **Firebase Consoleで承認済みドメインを確認**
   - Authentication > Settings > 承認済みドメイン
   - `localhost`が含まれていることを確認

2. **開発環境のドメインを追加**
   - WebContainer環境の場合: `*.webcontainer-api.io`
   - その他の開発環境: 具体的なドメイン

3. **環境変数の確認**
   ```env
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   ```

### 4. Stripe決済エラー

#### 症状
```
Stripe: No such price: 'price_xxx'
```

#### 原因
- 動的価格設定を使用している
- 実際のStripe Price IDを使用していない
- テストモードと本番モードの混同

#### 解決策
1. **Stripe DashboardでPrice IDを確認**
   - Products > 該当商品 > Pricing
   - 実際のPrice IDをコピー

2. **コード内で実際のPrice IDを使用**
   ```javascript
   const priceIds = {
     premium_monthly: 'price_1Rl6VZQoDVsMq3SiLcu7GnkA' // 実際のID
   };
   ```

3. **テストモードと本番モードの区別**
   - 開発時: テストモードのキーを使用
   - 本番時: 本番モードのキーを使用

### 5. 環境変数エラー

#### 症状
```
Error: Cannot find module 'firebase-admin'
```

#### 原因
- 環境変数が正しく設定されていない
- 必須の環境変数が不足している

#### 解決策
1. **環境変数の確認**
   ```bash
   # ローカル開発
   cat .env
   
   # Render環境
   # Renderダッシュボードで環境変数を確認
   ```

2. **必須環境変数の確認**
   ```env
   # 必須環境変数
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_private_key
   ```

3. **特殊文字の処理**
   - 改行文字を含む環境変数は適切にエスケープ
   - 引用符の使用に注意

### 6. ビルドエラー

#### 症状
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

#### 原因
- 依存関係の問題
- Node.jsバージョンの不整合
- TypeScriptエラー

#### 解決策
1. **依存関係の再インストール**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Node.jsバージョンの確認**
   ```bash
   node --version  # 18.x以上推奨
   npm --version
   ```

3. **TypeScriptエラーの確認**
   ```bash
   npm run type-check
   ```

### 7. パフォーマンス問題

#### 症状
```
First Contentful Paint: 5.2s
```

#### 原因
- バンドルサイズが大きい
- 画像の最適化不足
- ネットワーク遅延

#### 解決策
1. **バンドルサイズの最適化**
   ```typescript
   // 動的インポートによる遅延読み込み
   const Dashboard = lazy(() => import('./components/Dashboard'));
   ```

2. **画像の最適化**
   - SVGアイコンの使用
   - 画像の圧縮
   - WebP形式の使用

3. **キャッシュ戦略の改善**
   ```javascript
   app.use(express.static(path.join(__dirname, '../dist'), {
     maxAge: '1y'
   }));
   ```

## 🔧 デバッグツール

### 1. ログの確認

#### サーバーログ
```javascript
// 構造化ログの出力
console.log('🛒 Checkout session作成リクエスト:', {
  type: req.body.type,
  planId: req.body.planId,
  userId: req.user?.uid
});
```

#### ブラウザコンソール
```javascript
// フロントエンドでのデバッグ
console.log('Firebase設定値:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
});
```

### 2. ネットワークタブの確認

#### リクエスト/レスポンスの確認
1. ブラウザの開発者ツールを開く
2. Networkタブを選択
3. 問題のあるリクエストを確認
4. ステータスコード、レスポンスヘッダー、レスポンスボディを確認

### 3. 環境変数の確認

#### ローカル開発
```bash
# .envファイルの確認
cat .env

# 環境変数の確認
echo $VITE_GEMINI_API_KEY
```

#### Render環境
1. Renderダッシュボードにアクセス
2. 該当サービスを選択
3. Environmentタブで環境変数を確認

## 📊 問題の診断手順

### 1. 基本確認
- [ ] アプリケーションが起動しているか
- [ ] ネットワーク接続が正常か
- [ ] 環境変数が正しく設定されているか

### 2. ログの確認
- [ ] サーバーログにエラーがないか
- [ ] ブラウザコンソールにエラーがないか
- [ ] ネットワークタブでリクエストが正常か

### 3. 機能別確認
- [ ] 認証機能が動作するか
- [ ] AI返信生成が動作するか
- [ ] 決済機能が動作するか

### 4. パフォーマンス確認
- [ ] 初回読み込み時間
- [ ] API応答時間
- [ ] エラー率

## 🚨 緊急時の対応

### 1. 本番環境での問題

#### 即座に確認すべき項目
1. **Renderログの確認**
   - エラーログの有無
   - メモリ使用量
   - CPU使用量

2. **ヘルスチェック**
   ```bash
   curl https://motetalk-0723.onrender.com/api/health
   ```

3. **環境変数の確認**
   - Renderダッシュボードで環境変数を確認
   - 必須環境変数が不足していないか

#### 緊急時の対応手順
1. **問題の特定**
   - ログの確認
   - エラーメッセージの分析
   - 影響範囲の特定

2. **一時的な対処**
   - 必要に応じてサービスを停止
   - ユーザーへの通知

3. **根本的な解決**
   - 問題の原因を特定
   - 修正の実装
   - テストの実行

### 2. ロールバック手順

#### コードのロールバック
```bash
# 前のコミットに戻す
git log --oneline -5
git revert <commit-hash>

# または特定のタグに戻す
git checkout <tag-name>
```

#### 環境変数のロールバック
1. Renderダッシュボードで環境変数を確認
2. 問題のある環境変数を修正
3. サービスを再起動

## 📚 参考資料

### 公式ドキュメント
- [Express.js Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Firebase Troubleshooting](https://firebase.google.com/docs/projects/troubleshooting)
- [Stripe Error Handling](https://stripe.com/docs/error-handling)
- [Render Troubleshooting](https://render.com/docs/troubleshooting-deploys)

### コミュニティリソース
- [Stack Overflow - Express.js](https://stackoverflow.com/questions/tagged/express)
- [Firebase Community](https://firebase.google.com/community)
- [Stripe Community](https://support.stripe.com/)

### ツール
- [Postman](https://www.postman.com/) - APIテスト
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) - ブラウザデバッグ
- [Render Logs](https://render.com/docs/logs) - ログ監視 