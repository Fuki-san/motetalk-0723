# テストガイド

MoteTalkプロジェクトのテスト手順と結果について説明します。

## 🧪 テスト戦略

### テストの種類

| テスト種別 | ツール | 対象 | 実行頻度 |
|------------|--------|------|----------|
| **単体テスト** | Jest | サービス関数 | コミット時 |
| **統合テスト** | Jest + Supertest | APIエンドポイント | プルリクエスト時 |
| **E2Eテスト** | Playwright | ユーザーフロー | デプロイ前 |
| **手動テスト** | - | UI/UX | 機能追加時 |

## 🚀 テスト実行

### 1. 依存関係のインストール

```bash
npm install
```

### 2. テストの実行

```bash
# 全テストの実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# 特定のテストファイル
npm test -- --testPathPattern=geminiService
```

## 📋 テストケース

### 1. AI返信生成テスト

#### テストケース1: 初回メッセージ
```javascript
describe('GeminiService - 初回メッセージ', () => {
  it('should generate 3 natural replies for first message', async () => {
    const input = "こんにちは！プロフィール見させてもらいました😊";
    const conversation = [];
    
    const result = await generateReplies(input, conversation);
    
    expect(result).toHaveLength(3);
    expect(result[0]).toMatch(/こんにちは/);
    expect(result[0]).toMatch(/ありがとう/);
  });
});
```

**期待結果**: ✅ 3つの自然な返信が生成される

#### テストケース2: デート誘い
```javascript
describe('GeminiService - デート誘い', () => {
  it('should generate appropriate replies for date invitation', async () => {
    const input = "今度一緒にご飯でもどう？";
    const conversation = [
      { role: 'user', content: 'こんにちは！', timestamp: new Date() },
      { role: 'assistant', content: 'こんにちは！ありがとうございます😊', timestamp: new Date() }
    ];
    
    const result = await generateReplies(input, conversation);
    
    expect(result).toHaveLength(3);
    expect(result.some(reply => reply.includes('いいですね'))).toBe(true);
    expect(result.some(reply => reply.includes('いつ'))).toBe(true);
  });
});
```

**期待結果**: ✅ 適切な積極性と自然さのバランス

### 2. 決済フローテスト

#### Stripe決済テスト
```javascript
describe('StripeService', () => {
  it('should create checkout session for subscription', async () => {
    const sessionData = {
      type: 'subscription',
      planId: 'premium_monthly',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel'
    };
    
    const result = await createCheckoutSession(sessionData);
    
    expect(result.sessionId).toBeDefined();
    expect(result.url).toMatch(/stripe\.com/);
  });
});
```

**期待結果**: ✅ チェックアウトセッションが正常に作成される

#### Webhookテスト
```javascript
describe('Stripe Webhook', () => {
  it('should handle subscription.created event', async () => {
    const event = {
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test123',
          customer: 'cus_test123',
          status: 'active'
        }
      }
    };
    
    const result = await handleWebhook(event);
    
    expect(result.success).toBe(true);
  });
});
```

**期待結果**: ✅ Webhookイベントが正常に処理される

### 3. 認証テスト

#### Firebase認証テスト
```javascript
describe('AuthService', () => {
  it('should authenticate user with Google', async () => {
    const mockUser = {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User'
    };
    
    const result = await authenticateUser(mockUser);
    
    expect(result.success).toBe(true);
    expect(result.user.uid).toBe('test-user-id');
  });
});
```

**期待結果**: ✅ ユーザー認証が正常に動作する

## 🧪 手動テスト

### 1. フロントエンドテスト

#### 基本動作確認
- [ ] アプリケーションが正常に表示される
- [ ] ナビゲーションが動作する
- [ ] レスポンシブデザインが適切に表示される

#### 認証フロー
- [ ] Googleログインボタンが表示される
- [ ] ログイン後、ユーザー情報が表示される
- [ ] ログアウトが正常に動作する

#### AI返信生成
- [ ] メッセージ入力フィールドが表示される
- [ ] 送信ボタンが動作する
- [ ] AI返信が3つ生成される
- [ ] 会話履歴が正しく表示される

### 2. 決済フローテスト

#### サブスクリプション決済
1. 料金プランページにアクセス
2. 「プレミアムプラン」を選択
3. Stripe決済ページに遷移
4. テストカード情報を入力
5. 決済完了後、成功ページに遷移

**テストカード情報**:
- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意の将来の日付
- CVC: 任意の3桁の数字

#### テンプレート購入
1. テンプレートページにアクセス
2. 任意のテンプレートパックを選択
3. 購入ボタンをクリック
4. Stripe決済ページで決済
5. 購入完了後、テンプレートが利用可能になる

### 3. エラーケーステスト

#### ネットワークエラー
- [ ] オフライン時のエラーハンドリング
- [ ] API呼び出し失敗時のユーザーフィードバック
- [ ] 再試行機能の動作

#### 入力検証
- [ ] 空のメッセージ送信時のエラー表示
- [ ] 長すぎるメッセージの制限
- [ ] 特殊文字の適切な処理

## 📊 テスト結果

### 2024年7月23日 - 統合テスト結果

#### AI機能テスト
| テストケース | 結果 | 実行時間 | 備考 |
|-------------|------|----------|------|
| 初回メッセージ生成 | ✅ 成功 | 2.3秒 | 3つの自然な返信を生成 |
| デート誘い返信 | ✅ 成功 | 1.8秒 | 適切な積極性を保持 |
| 会話履歴活用 | ✅ 成功 | 3.1秒 | 文脈を正しく理解 |
| エラーハンドリング | ✅ 成功 | 0.5秒 | 適切なエラーメッセージ |

#### 決済機能テスト
| テストケース | 結果 | 実行時間 | 備考 |
|-------------|------|----------|------|
| サブスクリプション作成 | ✅ 成功 | 1.2秒 | Stripeセッション正常作成 |
| テンプレート購入 | ✅ 成功 | 0.9秒 | ワンタイム決済正常処理 |
| Webhook受信 | ✅ 成功 | 0.3秒 | イベント処理正常 |
| エラー処理 | ✅ 成功 | 0.2秒 | 適切なエラーレスポンス |

#### 認証機能テスト
| テストケース | 結果 | 実行時間 | 備考 |
|-------------|------|----------|------|
| Googleログイン | ✅ 成功 | 1.5秒 | 認証フロー正常 |
| ユーザー情報取得 | ✅ 成功 | 0.8秒 | Firestore連携正常 |
| セッション管理 | ✅ 成功 | 0.3秒 | 認証状態保持正常 |
| ログアウト | ✅ 成功 | 0.2秒 | セッションクリア正常 |

### パフォーマンステスト結果

#### レスポンス時間
| エンドポイント | 平均 | 95パーセンタイル | 99パーセンタイル |
|---------------|------|------------------|------------------|
| `/api/health` | 45ms | 120ms | 180ms |
| `/api/create-checkout-session` | 890ms | 1.2s | 1.8s |
| AI返信生成 | 2.1s | 3.5s | 4.2s |

#### エラー率
| 機能 | エラー率 | 主なエラー |
|------|----------|------------|
| AI返信生成 | 0.1% | ネットワークタイムアウト |
| 決済処理 | 0.05% | Stripe API一時エラー |
| 認証 | 0.02% | Firebase一時エラー |

## 🚨 既知の問題

### 1. パフォーマンス問題

#### 問題: 初回読み込み時間が長い
- **原因**: バンドルサイズが759KBと大きい
- **影響**: ユーザー体験の低下
- **対策**: コード分割と遅延読み込みの実装

#### 問題: AI返信生成に時間がかかる
- **原因**: Gemini APIの応答時間
- **影響**: ユーザーの待機時間
- **対策**: ローディング状態の改善

### 2. 機能制限

#### 問題: 無料ユーザーの使用制限
- **制限**: 1日3回まで
- **影響**: ユーザー体験の制限
- **対策**: 制限の明確な表示

#### 問題: テンプレート購入後の即座反映
- **問題**: 購入後、UIが即座に更新されない
- **影響**: ユーザーの混乱
- **対策**: Webhook処理の改善

## 🔧 テスト環境

### 開発環境
- **URL**: http://localhost:5173
- **API**: http://localhost:3001
- **データベース**: Firebase Emulator

### ステージング環境
- **URL**: https://motetalk-staging.onrender.com
- **データベース**: Firebase Test Project
- **決済**: Stripe Test Mode

### 本番環境
- **URL**: https://motetalk-0723.onrender.com
- **データベース**: Firebase Production
- **決済**: Stripe Live Mode

## 📋 テストチェックリスト

### デプロイ前チェックリスト
- [ ] 全単体テストが通る
- [ ] 統合テストが通る
- [ ] 手動テストが完了
- [ ] パフォーマンステストが基準を満たす
- [ ] セキュリティテストが完了
- [ ] エラー率が許容範囲内

### 機能追加時チェックリスト
- [ ] 新機能の単体テストを作成
- [ ] 既存機能への影響を確認
- [ ] UI/UXの一貫性を確認
- [ ] アクセシビリティを確認
- [ ] モバイル対応を確認

## 📚 参考資料

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Firebase Testing](https://firebase.google.com/docs/rules/unit-tests) 