# リファクタリングガイドライン

## 🚨 重要な教訓・よくあるエラー

### 1. 重複保存の根本原因と解決策

#### 問題の特定
```javascript
// ❌ 問題のある実装
// Webhookで同じデータが2回保存される
case 'checkout.session.completed':
  await savePurchaseToDatabase(session);      // 1回目の保存
  await handleTemplatePurchase(session);      // 2回目の保存（重複！）
```

#### 解決策
```javascript
// ✅ 修正後の実装
case 'checkout.session.completed':
  await savePurchaseToDatabase(session);      // 購入データ保存
  await updateUserPurchasedTemplates(session); // ユーザー情報更新のみ
```

**教訓**: 
- 同じデータを複数の関数で保存しない
- 保存と更新の責任を分離する
- Webhook処理は慎重に設計する

### 2. ESモジュールの統一

#### よくあるエラー
```javascript
// ❌ エラー: The requested module does not provide an export named 'functionName'
// 原因: module.exports と export の混在

// 修正前
module.exports = { function1, function2 };  // CommonJS

// 修正後
export { function1, function2 };  // ESモジュール
```

**教訓**: 
- プロジェクト全体でESモジュール（`import`/`export`）に統一
- 新規ファイル作成時は必ずESモジュールを使用
- 既存ファイルの修正時も統一性を保つ

### 3. データ表示の統一

#### 問題の特定
```javascript
// ❌ 異なる関数で異なる名前を設定
// savePurchaseToDatabase で
templateName: '初回メッセージパック'

// handleTemplatePurchase で  
templateName: '初回メッセージ'
```

#### 解決策
```javascript
// ✅ 共通ユーティリティを使用
templateName: getTemplateDisplayName(templateId)  // 統一された名前
```

**教訓**: 
- 表示用データは共通ユーティリティで管理
- ハードコードされた文字列は避ける
- 一貫性のある命名規則を適用

### 4. 重複除去ロジックの実装

#### 問題の特定
```javascript
// ❌ 重複チェックなし
const purchases = allPurchases.filter(p => p.type === 'template');
```

#### 解決策
```javascript
// ✅ 重複除去ロジック実装
const uniquePurchases = removeDuplicatePurchases(
  allPurchases.filter(p => p.type === 'template')
);

// 重複除去関数
function removeDuplicatePurchases(purchases) {
  const seen = new Set();
  return purchases.filter(purchase => {
    const key = purchase.stripeSessionId || purchase.id;
    if (seen.has(key)) {
      console.log('🔍 重複を除去:', key);
      return false;
    }
    seen.add(key);
    return true;
  });
}
```

**教訓**: 
- データベースから取得したデータは必ず重複除去を行う
- `stripeSessionId`ベースの重複除去が効果的
- 重複除去の過程をログ出力して確認

### 5. 日付フォーマットの統一

#### 問題の特定
```javascript
// ❌ 異なるフォーマットが混在
purchasedAt: '2025/7/26'  // 時間なし
purchasedAt: '2025-07-26T15:30:00.000Z'  // ISO形式
```

#### 解決策
```javascript
// ✅ 統一されたフォーマット
purchasedAt: formatDateToJapanese(date)  // '2025/07/26 15:30'

// 共通ユーティリティ
function formatDateToJapanese(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}
```

**教訓**: 
- 日付フォーマットは共通ユーティリティで統一
- ユーザーにとって分かりやすい形式を選択
- 時間情報も含めて表示する

## 🔧 リファクタリング手順

### 1. 問題の特定
1. **サーバーログの詳細確認**
   ```javascript
   console.log('🔍 データベースから取得した全購入データ:', allPurchases);
   console.log('🔍 重複除去後の詳細:', uniquePurchases);
   ```

2. **重複データの調査**
   ```bash
   # 重複除去スクリプト実行
   node scripts/cleanup-duplicate-purchases.js
   ```

3. **根本原因の特定**
   - 同じ処理が複数の関数で実行されていないか
   - データの保存と更新が適切に分離されているか
   - 共通ユーティリティが正しく使用されているか

### 2. 修正の実装
1. **重複保存の修正**
   - 保存処理を1つの関数に統一
   - 更新処理を分離

2. **ESモジュールの統一**
   - 全てのファイルで`export`を使用
   - `module.exports`を削除

3. **表示データの統一**
   - 共通ユーティリティを使用
   - ハードコードされた文字列を削除

### 3. テストと確認
1. **サーバー再起動**
   ```bash
   pkill -f "node server/index.js"
   node server/index.js
   ```

2. **動作確認**
   - ブラウザで購入履歴を確認
   - 新規購入で重複が発生しないかテスト
   - 日付フォーマットが統一されているか確認

## 📋 リファクタリングチェックリスト

### 修正前の確認
- [ ] サーバーログで問題を特定
- [ ] 根本原因を明確に把握
- [ ] 修正範囲を限定

### 修正の実装
- [ ] 重複保存の修正
- [ ] ESモジュールの統一
- [ ] 表示データの統一
- [ ] 日付フォーマットの統一

### 修正後の確認
- [ ] サーバー再起動
- [ ] 動作確認
- [ ] 新規購入テスト
- [ ] 既存データの確認

## 🎯 今後の予防策

### 1. 新機能開発時
- 重複保存の可能性を常にチェック
- 共通ユーティリティの使用を徹底
- ESモジュールの統一性を維持

### 2. コードレビュー時
- 重複処理がないかチェック
- 表示データの統一性を確認
- エラーハンドリングの適切性を確認

### 3. デバッグ時
- サーバーログの詳細確認
- データベースの実際の状態確認
- 重複除去ロジックの動作確認 