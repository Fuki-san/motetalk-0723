# トラブルシューティングガイド

## 購入履歴表示の問題

### 問題
購入履歴でテンプレート名が重複して表示される

### 症状
```
会話ネタ一覧
会話ネタ一覧
¥2,500
2025/7/28
```

### 原因
`src/components/MyPage.tsx`で`templateInfo.name`と`purchase.templateName`の両方が表示されていた

### 解決策
```typescript
// 修正前
<h4>{templateInfo ? templateInfo.name : purchase.templateName}</h4>
<p>{templateInfo ? `${templateInfo.name}` : 'テンプレートパック'}</p>

// 修正後
<h4>{templateInfo ? templateInfo.name : purchase.templateName}</h4>
// 重複する行を削除
```

### 修正日
2025-07-28

## テンプレート整理

### 問題
LINE移行テンプレートが不要になった

### 解決策
1. `src/data/templateData.ts`からLINE移行テンプレートを削除
2. `src/services/stripeService.ts`からも削除
3. 3つのテンプレート（初回メッセージ、デート誘い、会話ネタ）のみに整理

### 修正日
2025-07-28

## 購入反映問題

### 問題
テンプレート購入後、購入済みタブや購入履歴に反映されない

### 原因
1. Stripe Webhookが正常に受信されない
2. ユーザー識別方式の問題
3. 認証ヘッダーの不足

### 解決策
1. **Stripe Webhook設定**
   - ngrok URLを正しく設定
   - `STRIPE_WEBHOOK_SECRET`環境変数を設定

2. **ユーザー識別方式変更**
   - メールアドレスマッチングからメタデータ方式に変更
   - `session.metadata.userId`を使用

3. **認証ヘッダー追加**
   - フロントエンドで`Authorization: Bearer ${authToken}`ヘッダーを追加

### 修正日
2025-07-28

## Sentry設定問題

### 問題
- `⚠️ VITE_SENTRY_DSNが設定されていません。Sentry監視が無効です。`
- ビルド時に環境変数が正しく置換されない

### 原因
1. 非推奨APIの使用
2. 環境変数のアクセス方法が間違っている
3. 重複初期化

### 解決策
1. **Sentry設定の簡素化**
   ```typescript
   // 非推奨APIを削除
   // 基本的なエラー監視のみに変更
   ```

2. **環境変数アクセス修正**
   ```typescript
   // 修正前
   process.env.VITE_SENTRY_DSN
   
   // 修正後
   import.meta.env.VITE_SENTRY_DSN
   ```

3. **初期化タイミング修正**
   - `src/main.tsx`で早期初期化
   - 重複初期化を削除

### 修正日
2025-07-28

## 静的ファイル配信問題

### 問題
- `404 Not Found`エラーで静的ファイルが読み込まれない
- `/assets/*.js`と`/assets/*.css`ファイルが見つからない

### 原因
`server/index.js`の正規表現パターンが古いViteの出力形式に対応していない

### 解決策
```javascript
// 修正前
app.use('/assets', express.static(path.join(__dirname, '../dist/assets')));

// 修正後
app.use('/assets', express.static(path.join(__dirname, '../dist/assets')));
app.use(/\/assets\/.*\.js/, express.static(path.join(__dirname, '../dist')));
app.use(/\/assets\/.*\.css/, express.static(path.join(__dirname, '../dist')));
```

### 修正日
2025-07-28

## Templatesコンポーネント最適化

### 問題
- テンプレートページで冗長なconsole.logが表示される
- 不要な再レンダリングが発生

### 原因
1. メモ化が適用されていない
2. 複数のuseEffectが存在
3. 開発モードログ制御がない

### 解決策
1. **メモ化の適用**
   ```typescript
   const getDisplayTemplates = useMemo(() => {
     // テンプレート表示ロジック
   }, [viewMode, purchasedTemplates, userProfile]);
   ```

2. **useEffect統合**
   ```typescript
   useEffect(() => {
     // 統合されたロジック
   }, [userProfile, viewMode]);
   ```

3. **開発モードログ制御**
   ```typescript
   if (import.meta.env.DEV) {
     console.log('デバッグ情報');
   }
   ```

### 修正日
2025-07-28

## サーバー起動問題

### 問題
- `TypeError: crypto.hash is not a function`
- Node.jsバージョンの互換性問題

### 原因
Node.jsバージョンが古いため、新しいcrypto APIに対応していない

### 解決策
1. **Node.jsバージョン更新**
   ```bash
   nvm use 20.19.0
   ```

2. **依存関係の再インストール**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 修正日
2025-07-28 