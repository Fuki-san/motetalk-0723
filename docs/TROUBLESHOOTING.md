# トラブルシューティング

## 静的ファイル配信エラー (404 Not Found)

### 問題の症状
```
Failed to load resource: the server responded with a status of 404 (Not Found)
- vendor-DavUf6mE.js
- ui-CnXIi-yh.js  
- services-bK8rpTAd.js
```

### 原因
サーバーの静的ファイル配信設定で、`/assets/`ディレクトリ内のファイルが正しく処理されていない。

**修正前の設定:**
```javascript
if (req.path.match(/\/index-.*\.js/))  // index-*.jsのみ
if (req.path.match(/\/index-.*\.css/)) // index-*.cssのみ
```

**問題点:**
- Viteのビルド出力では、ファイルが`dist/assets/`ディレクトリに配置される
- サーバーが`/assets/vendor-*.js`、`/assets/ui-*.js`、`/assets/services-*.js`を処理できていない

### 解決方法
サーバーの静的ファイル配信パターンを修正：

```javascript
// 修正後
if (req.path.match(/\/assets\/.*\.js/))  // assets/内のすべての.jsファイル
if (req.path.match(/\/assets\/.*\.css/)) // assets/内のすべての.cssファイル
```

### 修正箇所
- `server/index.js` の静的ファイル配信ミドルウェア部分

### 確認方法
```bash
# 静的ファイルが正常に配信されているか確認
curl -I http://localhost:3001/assets/vendor-DavUf6mE.js
curl -I http://localhost:3001/assets/ui-CnXIi-yh.js
curl -I http://localhost:3001/assets/services-bK8rpTAd.js
```

### 予防策
- Viteのビルド出力構造を理解し、サーバーの静的ファイル配信設定と一致させる
- 新しいアセットファイルを追加する際は、配信パターンが正しく設定されているか確認する

## Sentry設定エラー

### 問題の症状
```
⚠️ VITE_SENTRY_DSNが設定されていません。Sentry監視が無効です。
```

ビルド時のエラー：
```
"BrowserTracing" is not exported by "@sentry/react"
"startTransaction" is not exported by "@sentry/react"
"getCurrentHub" is not exported by "@sentry/react"
```

### 原因
- Sentryの新しいバージョン（@sentry/react@9.42.0）でAPIが大幅に変更されている
- 古いAPI（`BrowserTracing`、`startTransaction`、`getCurrentHub`）が削除されている
- `main.tsx`でSentryの初期化が呼び出されていない

### 解決方法
1. **Sentry設定の簡素化**：
   ```typescript
   // src/config/sentry.ts
   import * as Sentry from "@sentry/react";
   
   export const initSentry = () => {
     if (process.env.NODE_ENV === 'production') {
       const dsn = process.env.VITE_SENTRY_DSN;
       
       if (!dsn) {
         console.warn('⚠️ VITE_SENTRY_DSNが設定されていません。Sentry監視が無効です。');
         return;
     }
   
       Sentry.init({
         dsn: dsn,
         environment: process.env.NODE_ENV,
         beforeSend(event) {
           if (event.request?.headers) {
             delete event.request.headers['authorization'];
           }
           return event;
         },
       });
       
       console.log('✅ Sentry監視が有効になりました');
     }
   };
   ```

2. **main.tsxでの初期化**：
   ```typescript
   // src/main.tsx
   import { initSentry } from './config/sentry';
   
   // Sentry初期化（アプリケーションの早期に実行）
   initSentry();
   ```

### 確認方法
- 本番環境でアプリケーションを起動
- ブラウザのコンソールで「✅ Sentry監視が有効になりました」メッセージを確認
- Sentryダッシュボードでエラーが受信されることを確認

### 予防策
- Sentryの新しいバージョンにアップデートする際は、APIの変更を確認する
- 基本的なエラー監視のみを使用し、高度な機能は必要に応じて追加する
- 環境変数`VITE_SENTRY_DSN`が正しく設定されているか確認する

## Sentry環境変数アクセスエラー

### 問題の症状
```
⚠️ VITE_SENTRY_DSNが設定されていません。Sentry監視が無効です。
```

ビルド後のファイルで`VITE_SENTRY_DSN`が文字列として残る：
```javascript
// ビルド後も文字列として残る
const dsn = "VITE_SENTRY_DSN";
```

### 原因
- Viteでは、ブラウザで実行されるコードで環境変数を使用する場合、`process.env`ではなく`import.meta.env`を使用する必要がある
- 環境変数がビルド時に正しく置換されていない

### 解決方法
環境変数アクセス方法を修正：

```typescript
// 修正前
if (process.env.NODE_ENV === 'production') {
  const dsn = process.env.VITE_SENTRY_DSN;
  // ...
}

// 修正後
if (import.meta.env.PROD) {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  // ...
}
```

### 修正箇所
- `src/config/sentry.ts` - 環境変数アクセス方法を修正
- `src/App.tsx` - 重複するSentry初期化を削除

### 確認方法
```bash
# ビルド後のファイルで環境変数が正しく置換されているか確認
grep -o "VITE_SENTRY_DSN" dist/assets/index-*.js
# 結果が空であることを確認

grep -o "https://your-sentry-dsn" dist/assets/index-*.js
# 実際のDSNが表示されることを確認
```

### 予防策
- Viteプロジェクトでは、ブラウザで実行されるコードでは`import.meta.env`を使用する
- 環境変数の置換が正しく行われているか、ビルド後のファイルで確認する
- 重複する初期化処理がないか確認する

## 現在の主要問題（2025-07-25）

### 1. アカウント削除時の購入履歴残存問題

**問題の詳細：**
- アカウント削除を実行しても、購入履歴が完全に削除されていない
- 再ログイン時に前の購入履歴が残っている
- サーバーログでは会話履歴の削除は成功しているが、購入履歴の削除ログが表示されていない

**期待される動作：**
- アカウント削除時に購入履歴、サブスクリプション履歴、テンプレート購入状況が完全に削除される
- 再ログイン時に購入履歴が空の状態になる

**現在の状況：**
- サーバー側のコードは修正済みだが、実際の削除処理が実行されていない
- 購入履歴削除のログが出力されていない

**解決策：**
- アカウント削除APIの購入履歴削除処理をデバッグ
- `userId`の一致確認とデータ取得ロジックの見直し

### 2. テンプレート購入履歴の商品名表示問題

**問題の詳細：**
- 購入履歴で「テンプレートパック」という汎用的な表示になっている
- 具体的な商品名（例：「初回メッセージ神パターン集」「デート誘いテンプレート」）が表示されていない

**期待される動作：**
- 購入履歴に具体的な商品名が表示される
- 例：「初回メッセージ神パターン集」「デート誘いテンプレート」「告白テンプレート」など

**現在の状況：**
- `getPurchasedTemplateInfo`関数は修正済みだが、実際の表示が改善されていない
- フロントエンドでエラーが発生している可能性

**解決策：**
- 購入履歴のデータ構造を確認
- テンプレート名の取得ロジックを修正

### 3. サブスク会員のテンプレート表示問題

**問題の詳細：**
- サブスク会員がテンプレートページのショップタブで全てのテンプレートを見ることができる
- 未購入のテンプレートのみが表示されるべき

**期待される動作：**
- サブスク会員でもショップタブでは未購入テンプレートのみが表示される
- 購入済みテンプレートは購入済みタブでのみ表示される

**現在の状況：**
- ショップタブの表示ロジックは修正済みだが、実際の動作が改善されていない
- サブスク会員でも全てのテンプレートが表示されている

**解決策：**
- テンプレート表示ロジックのデバッグ
- 購入状況の取得と表示フィルタリングの確認

### 4. テンプレート購入後の反映問題

**問題の詳細：**
- テンプレートを購入しても、購入済みタブに表示されない
- 購入後に購入済みタブに自動切り替えされない

**期待される動作：**
- テンプレート購入後に購入済みタブに自動切り替え
- 購入したテンプレートが購入済みタブに表示される

**現在の状況：**
- `handlePurchase`関数は修正済みだが、実際の動作が改善されていない
- 購入後の状態更新が正しく動作していない

**解決策：**
- 購入処理後の状態更新ロジックのデバッグ
- 購入済みテンプレートの取得と表示ロジックの確認

### 5. サブスク会員のショップタブ内容問題

**問題の詳細：**
- サブスク会員のテンプレートページで、ショップタブ内に購入済みテンプレートのコンテンツが表示されている
- ショップタブは未購入テンプレートのみを表示すべき

**期待される動作：**
- ショップタブでは未購入テンプレートのみが表示される
- 購入済みテンプレートのコンテンツは購入済みタブでのみ表示される

**現在の状況：**
- ショップタブの表示ロジックは修正済みだが、実際の動作が改善されていない
- サブスク会員のショップタブに購入済みコンテンツが表示されている

**解決策：**
- ショップタブの表示フィルタリングロジックのデバッグ
- 購入状況の取得と表示制御の確認

## 根本原因の分析

### データフローの問題
1. **購入履歴の削除処理**：サーバー側のコードは正しいが、実際の削除処理が実行されていない
2. **フロントエンドの状態管理**：修正したコードが実際の動作に反映されていない
3. **データの同期問題**：購入状況の取得と表示の間にタイミングの問題がある

### デバッグが必要な箇所
1. アカウント削除時の購入履歴削除処理
2. テンプレート購入履歴のデータ取得
3. テンプレート表示のフィルタリングロジック
4. 購入後の状態更新処理

## 次のステップ

1. **サーバー側のデバッグ**
   - アカウント削除APIの購入履歴削除処理を詳細にログ出力
   - データ取得と削除の条件を確認

2. **フロントエンドのデバッグ**
   - 購入履歴の表示処理を詳細にログ出力
   - テンプレート表示のフィルタリング処理を確認

3. **データ構造の確認**
   - 購入履歴のデータ構造を確認
   - テンプレート購入状況のデータ構造を確認

4. **段階的な修正**
   - 各問題を個別に修正
   - 修正後に動作確認を実施 