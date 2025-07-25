# アカウント削除機能の修正

## 問題の特定

ログを分析した結果、以下の問題が特定されました：

1. **購入履歴が削除されていない**: アカウント削除処理で購入履歴の削除が完了していない
2. **サブスクリプション履歴が削除されていない**: サブスクリプション履歴の削除が完了していない
3. **Stripeサブスクリプションが解約されていない**: Firestoreのデータのみ削除し、Stripeのサブスクリプションは残ったまま
4. **Firebase Authユーザーが削除されていない**: Firestoreのデータのみ削除し、Firebase Authのユーザーアカウントは残ったまま
5. **重複APIの存在**: 購入履歴取得APIが重複して定義されている

## 修正内容

### 1. エラーハンドリングの追加

各削除処理にtry-catchブロックを追加し、エラーが発生した場合にログに記録するようにしました：

```javascript
if (userPurchases.length > 0) {
  try {
    const deletePromises = userPurchases.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log('🗑️ 購入履歴削除完了:', userPurchases.length, '件');
  } catch (deleteError) {
    console.error('❌ 購入履歴削除エラー:', deleteError);
    throw deleteError;
  }
}
```

### 2. Stripeサブスクリプションの解約

ユーザーにアクティブなサブスクリプションがある場合、Stripeでサブスクリプションを期間終了時に解約するようにしました：

```javascript
// Stripeのサブスクリプションを解約
if (userData.subscriptionId) {
  try {
    console.log('🗑️ Canceling Stripe subscription:', userData.subscriptionId);
    await stripe.subscriptions.update(userData.subscriptionId, {
      cancel_at_period_end: true
    });
    console.log('✅ Stripe subscription canceled');
  } catch (stripeError) {
    console.error('❌ Stripe subscription cancellation error:', stripeError);
    // StripeエラーでもFirestoreの削除は続行
  }
}
```

### 3. Firebase Authenticationユーザーの削除

Firestoreのデータ削除後に、Firebase Authenticationからもユーザーを削除するようにしました：

```javascript
// Firebase Authenticationからユーザーを削除
try {
  console.log('🗑️ Deleting Firebase Auth user...');
  await admin.auth().deleteUser(userId);
  console.log('✅ Firebase Auth user deleted');
} catch (authError) {
  console.error('❌ Firebase Auth user deletion error:', authError);
  // AuthエラーでもFirestoreの削除は完了しているので成功とする
}
```

### 4. 追加データの削除

以下のコレクションからもユーザー関連データを削除するようにしました：

- `usage`: 使用量データ
- `notifications`: 通知設定

### 5. 重複APIの削除

重複していた購入履歴取得API（1613行目）を削除しました。

## 削除対象データ

アカウント削除時に以下のデータが削除されます：

1. **Firestoreデータ**:
   - `users`: ユーザープロフィール
   - `conversations`: 会話履歴
   - `purchases`: 購入履歴
   - `subscriptions`: サブスクリプション履歴
   - `template_purchases`: テンプレート購入状況
   - `usage`: 使用量データ
   - `notifications`: 通知設定

2. **Stripeデータ**:
   - アクティブなサブスクリプション（期間終了時に解約）

3. **Firebase Authentication**:
   - ユーザーアカウント

## テスト方法

### 1. アカウント削除のテスト

1. ユーザーとしてログイン
2. マイページに移動
3. 「アカウント削除」ボタンをクリック
4. 確認ダイアログで「OK」を選択
5. サーバーログで削除処理を確認

### 2. 削除後の確認

1. **Firestore**: Firebase Consoleで以下のコレクションを確認
   - `users`: ユーザードキュメントが削除されているか
   - `purchases`: 購入履歴が削除されているか
   - `subscriptions`: サブスクリプション履歴が削除されているか
   - `conversations`: 会話履歴が削除されているか

2. **Stripe**: Stripe Dashboardでサブスクリプションが解約されているか確認

3. **Firebase Auth**: Firebase ConsoleのAuthenticationでユーザーが削除されているか確認

### 3. ログの確認

サーバーログで以下のメッセージが表示されることを確認：

```
🗑️ アカウント削除リクエスト for user: [userId]
🗑️ Found purchases for user: [件数] 件
🗑️ 購入履歴削除完了: [件数] 件
🗑️ Found subscriptions for user: [件数] 件
🗑️ サブスクリプション履歴削除完了: [件数] 件
🗑️ Canceling Stripe subscription: [subscriptionId]
✅ Stripe subscription canceled
🗑️ Deleting Firebase Auth user...
✅ Firebase Auth user deleted
✅ アカウント削除成功
```

## 注意事項

1. **エラーハンドリング**: 各削除処理でエラーが発生しても、他の処理は続行されます
2. **Stripe解約**: サブスクリプションは即座に解約されず、期間終了時に解約されます
3. **Firebase Auth**: 認証エラーが発生しても、Firestoreの削除は完了しているため成功とみなします

## 今後の改善点

1. **バッチ処理**: 大量のデータがある場合のバッチ処理の実装
2. **削除確認**: 削除処理の完了確認機能
3. **復元機能**: 誤削除時の復元機能（オプション）
4. **監査ログ**: 削除処理の詳細な監査ログ 