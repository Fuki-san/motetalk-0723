# 開発ルール・ガイドライン

## 🚨 重要な教訓・よくあるエラー

### 1. 重複保存の根本原因
```javascript
// ❌ 悪い例：同じ処理が2つの関数で実行される
// Webhookで savePurchaseToDatabase と handleTemplatePurchase の両方が呼ばれる
await savePurchaseToDatabase(session);  // 1回目の保存
await handleTemplatePurchase(session);  // 2回目の保存（重複！）

// ✅ 良い例：1つの関数に統一
await savePurchaseToDatabase(session);  // 購入データ保存
await updateUserPurchasedTemplates(session);  // ユーザー情報更新のみ
```

**教訓**: 同じデータを複数の関数で保存しない。保存と更新は分離する。

### 2. ESモジュールのよくあるエラー
```javascript
// ❌ 悪い例：CommonJSとESモジュールの混在
module.exports = { function1, function2 };  // CommonJS
import { function1 } from './utils.js';     // ESモジュール

// ✅ 良い例：ESモジュールに統一
export { function1, function2 };  // ESモジュール
import { function1 } from './utils.js';     // ESモジュール
```

**教訓**: プロジェクト全体でESモジュール（`import`/`export`）に統一する。

### 3. テンプレート名の不統一
```javascript
// ❌ 悪い例：異なる関数で異なる名前を設定
// savePurchaseToDatabase で
templateName: '初回メッセージパック'

// handleTemplatePurchase で
templateName: '初回メッセージ'

// ✅ 良い例：共通ユーティリティを使用
templateName: getTemplateDisplayName(templateId)  // 統一された名前
```

**教訓**: テンプレート名などの表示用データは共通ユーティリティで管理する。

### 4. 重複除去ロジックの重要性
```javascript
// ❌ 悪い例：重複チェックなし
const purchases = allPurchases.filter(p => p.type === 'template');

// ✅ 良い例：重複除去ロジック実装
const uniquePurchases = removeDuplicatePurchases(
  allPurchases.filter(p => p.type === 'template')
);
```

**教訓**: データベースから取得したデータは必ず重複除去を行う。

### 5. 日付フォーマットの統一
```javascript
// ❌ 悪い例：異なるフォーマットが混在
purchasedAt: '2025/7/26'  // 時間なし
purchasedAt: '2025-07-26T15:30:00.000Z'  // ISO形式

// ✅ 良い例：統一されたフォーマット
purchasedAt: formatDateToJapanese(date)  // '2025/07/26 15:30'
```

**教訓**: 日付フォーマットは共通ユーティリティで統一する。

## 🚨 重複コード防止ルール

### 6. 新機能追加時のチェックリスト（更新版）
- [ ] 既存APIを検索して重複チェック
- [ ] 古いコメントやデモ用コードを削除
- [ ] 命名規則の統一確認
- [ ] 関連する古いコードも同時に削除
- [ ] **重複保存の可能性をチェック**（重要！）
- [ ] **ESモジュールの統一性を確認**
- [ ] **テンプレート名などの表示データの統一性を確認**
- [ ] **日付フォーマットの統一性を確認**

### 1. API定義の統一
```javascript
// ✅ 良い例：一箇所にまとめる
const API_ROUTES = {
  USER: {
    PROFILE: '/api/user-profile',
    SETTINGS: '/api/user-settings',
    DELETE: '/api/delete-account'
  },
  PURCHASE: {
    HISTORY: '/api/purchase-history',
    TEMPLATE: '/api/purchase-template'
  }
};
```

### 2. 新機能追加時のチェックリスト
- [ ] 既存APIを検索して重複チェック
- [ ] 古いコメントやデモ用コードを削除
- [ ] 命名規則の統一確認
- [ ] 関連する古いコードも同時に削除

### 3. 重複検出コマンド
```bash
# 重複API検出
grep -r "app\.(get|post|put|delete)" server/ | sort | uniq -d

# 重複関数検出
grep -r "function " server/ | sort | uniq -d

# 重複エンドポイント検出
grep -r "/api/" server/ | sort | uniq -d
```

## 📁 ファイル構造ルール

### 推奨構造
```
server/
├── routes/
│   ├── user.js      // ユーザー関連API
│   ├── purchase.js  // 購入関連API
│   └── chat.js      // チャット関連API
├── middleware/
│   ├── auth.js      // 認証ミドルウェア
│   └── validation.js // バリデーション
└── index.js         // メインファイル
```

## 🏷️ 命名ルール

### API エンドポイント
```javascript
// ✅ 良い例：一貫した命名
app.get('/api/user-profile', ...);
app.post('/api/user-settings', ...);
app.delete('/api/delete-account', ...);

// ❌ 悪い例：混在する命名
app.get('/api/user-profile', ...);
app.post('/api/settings', ...);  // ← 統一されていない
app.delete('/api/account-delete', ...);  // ← 順序が違う
```

### 関数・変数名
```javascript
// ✅ 良い例：明確で一貫した命名
const getUserProfile = async (userId) => { ... };
const deleteUserAccount = async (userId) => { ... };

// ❌ 悪い例：曖昧な命名
const getProfile = async (id) => { ... };  // ← 何のプロフィールか不明
const deleteAccount = async (uid) => { ... };  // ← 何のアカウントか不明
```

## 💬 コメントルール

### API コメント
```javascript
// ✅ 良い例：明確なコメント
/**
 * ユーザープロフィール取得API
 * @route GET /api/user-profile
 * @auth required
 * @returns {Object} userProfile
 */
app.get('/api/user-profile', ...);

// ❌ 悪い例：曖昧なコメント
// ユーザー情報取得（デモ用）  // ← 古いコードの残り
app.get('/api/user-profile', ...);
```

### 処理コメント
```javascript
// ✅ 良い例：処理の目的を明確に
```

## 🔧 デバッグ・トラブルシューティング

### 1. 重複データの調査手順
```javascript
// 1. データベースの実際の状態を確認
console.log('🔍 データベースから取得した全購入データ:', allPurchases);

// 2. 重複除去の過程をログ出力
console.log('🔍 重複除去後の詳細:', uniquePurchases);

// 3. 各購入データの詳細を確認
console.log('🔍 購入データ詳細:', purchase);
```

### 2. ESモジュールエラーの対処法
```bash
# エラー: The requested module does not provide an export named 'functionName'
# 原因: module.exports と export の混在

# 修正方法
# 1. 全てのファイルで export を使用
export { function1, function2 };

# 2. サーバー再起動
pkill -f "node server/index.js"
node server/index.js
```

### 3. 重複除去スクリプトの実行
```bash
# 既存の重複データをクリーンアップ
node scripts/cleanup-duplicate-purchases.js

# 実行後の確認
# 1. サーバーログで重複が解消されているか確認
# 2. ブラウザで購入履歴を確認
# 3. 新規購入で重複が発生しないかテスト
```
// 購入履歴を削除
const userPurchases = purchasesSnapshot.docs.filter(doc => doc.data().userId === userId);

// ❌ 悪い例：何をしているか不明
// データ処理
const filtered = data.filter(item => item.userId === userId);
```

## 🔄 開発フロー

### 1. 新機能開発時
1. 既存コードを検索して重複チェック
2. 関連する古いコードを特定
3. 新しいコードを追加
4. 古いコードを削除
5. テスト実行

### 2. バグ修正時
1. 問題の原因を特定
2. 関連する古いコードも確認
3. 修正と同時に古いコードも削除
4. テスト実行

### 3. リファクタリング時
1. 全ファイルの重複チェック
2. 統一されていない命名を修正
3. 古いコメントを削除
4. テスト実行

## 🧪 テストルール

### 修正後の確認項目
- [ ] 新機能が正常に動作する
- [ ] 既存機能に影響がない
- [ ] 重複コードが削除されている
- [ ] 古いコメントが削除されている
- [ ] 命名が統一されている

## 📝 ドキュメント管理

### API一覧の管理
```markdown
# API一覧
## ユーザー関連
- GET /api/user-profile - ユーザープロフィール取得
- POST /api/user-settings - ユーザー設定更新
- DELETE /api/delete-account - アカウント削除

## 購入関連
- GET /api/purchase-history - 購入履歴取得
- POST /api/purchase-template - テンプレート購入
```

## 🚀 デプロイ前チェック

### 最終確認項目
- [ ] 重複APIがない
- [ ] 古いコードが削除されている
- [ ] 命名が統一されている
- [ ] コメントが適切である
- [ ] テストが通る
- [ ] ドキュメントが更新されている

## 💡 AIアシスタント使用時の注意点

### 指示の例
```
「既存のAPIを確認してから新しいAPIを追加してください」
「古いコードや重複コードがないかチェックしてください」
「命名規則を統一してください」
「関連する古いコードも削除してください」
```

### 確認すべき項目
- 既存のAPIエンドポイント
- 重複する関数や変数
- 古いコメントやデモ用コード
- 命名の一貫性

---

## 📋 チェックリスト（毎回確認）

### 新機能追加時
- [ ] 既存APIを検索
- [ ] 重複チェック
- [ ] 古いコード削除
- [ ] 命名統一
- [ ] コメント適切化
- [ ] テスト実行

### バグ修正時
- [ ] 原因特定
- [ ] 関連コード確認
- [ ] 古いコード削除
- [ ] テスト実行

### リファクタリング時
- [ ] 全ファイル重複チェック
- [ ] 命名統一
- [ ] 古いコメント削除
- [ ] テスト実行 