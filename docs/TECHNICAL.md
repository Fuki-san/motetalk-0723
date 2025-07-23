# 技術仕様書

MoteTalkプロジェクトの技術的な詳細と設計方針について説明します。

## 🏗️ アーキテクチャ概要

### システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド   │    │     バックエンド    │    │   外部サービス    │
│                 │    │                 │    │                 │
│ React + Vite    │◄──►│ Express.js      │◄──►│ Firebase        │
│ TypeScript      │    │ Node.js         │    │ Stripe          │
│ Tailwind CSS    │    │                 │    │ Gemini API      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|----------|------|------------|------|
| **フロントエンド** | React | 18.x | UIフレームワーク |
| | TypeScript | 5.x | 型安全性 |
| | Vite | 7.x | ビルドツール |
| | Tailwind CSS | 3.x | スタイリング |
| | Lucide React | 0.x | アイコン |
| **バックエンド** | Node.js | 18.x | ランタイム |
| | Express.js | 4.x | Webフレームワーク |
| | Firebase Admin | 12.x | Firebase統合 |
| **AI・ML** | Google Gemini | 2.0-Flash-001 | 自然言語処理 |
| **決済** | Stripe | 14.x | 決済処理 |
| **認証・DB** | Firebase | 10.x | 認証・データベース |
| **デプロイ** | Render | - | ホスティング |

## 🎯 技術選定の理由

### フロントエンド

#### React + TypeScript
- **理由**: 型安全性と開発効率のバランス
- **利点**: 
  - コンパイル時のエラー検出
  - IDEの優れたサポート
  - リファクタリングの安全性

#### Vite
- **理由**: 高速な開発サーバーとビルド
- **利点**:
  - HMR（Hot Module Replacement）
  - 高速なビルド時間
  - 豊富なプラグインエコシステム

#### Tailwind CSS
- **理由**: 効率的なスタイリング
- **利点**:
  - ユーティリティファースト
  - 一貫したデザインシステム
  - 小さなバンドルサイズ

### バックエンド

#### Express.js
- **理由**: シンプルで柔軟なWebフレームワーク
- **利点**:
  - 豊富なミドルウェアエコシステム
  - 学習コストが低い
  - 軽量で高速

#### Firebase
- **理由**: 認証とデータベースの統合ソリューション
- **利点**:
  - リアルタイムデータベース
  - 組み込みの認証システム
  - スケーラビリティ

### AI・決済

#### Google Gemini
- **理由**: 最新の自然言語処理能力
- **利点**:
  - 高品質なテキスト生成
  - 日本語対応
  - 合理的な価格

#### Stripe
- **理由**: 信頼性の高い決済プラットフォーム
- **利点**:
  - 豊富な決済方法
  - 優れた開発者体験
  - 強力なセキュリティ

## 📊 パフォーマンス設計

### フロントエンド最適化

#### コード分割
```typescript
// 動的インポートによる遅延読み込み
const Dashboard = lazy(() => import('./components/Dashboard'));
const Templates = lazy(() => import('./components/Templates'));
```

#### バンドル最適化
- Viteの自動コード分割
- Tree shakingによる未使用コードの除去
- 画像の最適化

### バックエンド最適化

#### キャッシュ戦略
```javascript
// 静的ファイルのキャッシュ設定
app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: '1y' // 1年間キャッシュ
}));
```

#### レート制限
```javascript
// API呼び出しの制限
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // 最大100リクエスト
});
```

## 🔒 セキュリティ設計

### 認証・認可

#### Firebase Authentication
- Google OAuth 2.0
- JWTトークンによる認証
- セッション管理

#### API セキュリティ
```javascript
// 認証ミドルウェア
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // トークン検証ロジック
};
```

### データ保護

#### 環境変数管理
- 機密情報は環境変数で管理
- `.env`ファイルはGitにコミットしない
- 本番環境では暗号化された環境変数を使用

#### 入力検証
```typescript
// 型安全性による入力検証
interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

## 📈 スケーラビリティ設計

### 水平スケーリング

#### ステートレス設計
- セッション情報はFirebaseに保存
- サーバー間で状態を共有しない

#### ロードバランシング対応
- 複数のRenderインスタンスに対応
- ヘルスチェックエンドポイント実装

### データベース設計

#### Firestore構造
```
users/
  {userId}/
    profile/
      email: string
      displayName: string
      subscriptionStatus: string
    conversations/
      {conversationId}/
        messages: array
        createdAt: timestamp
    purchases/
      {purchaseId}/
        type: string
        amount: number
        status: string
```

## 🔧 開発環境

### 開発ツール

#### コード品質
- ESLint: コードスタイル統一
- Prettier: コードフォーマット
- TypeScript: 型チェック

#### テスト戦略
```javascript
// ユニットテスト
describe('GeminiService', () => {
  it('should generate replies correctly', async () => {
    const result = await generateReplies('Hello', []);
    expect(result).toHaveLength(3);
  });
});
```

### CI/CD

#### GitHub Actions
```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test
      - run: npm run build
```

## 📊 監視・ログ

### ログ設計

#### 構造化ログ
```javascript
console.log('🛒 Checkout session作成リクエスト:', {
  type: req.body.type,
  planId: req.body.planId,
  userId: req.user?.uid
});
```

#### エラーハンドリング
```javascript
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // エラー通知サービスへの送信
});
```

### パフォーマンス監視

#### メトリクス収集
- API応答時間
- エラー率
- ユーザーアクティビティ

## 🚀 将来の拡張計画

### 短期計画（1-3ヶ月）
- [ ] プッシュ通知機能
- [ ] 会話履歴のエクスポート
- [ ] 多言語対応

### 中期計画（3-6ヶ月）
- [ ] モバイルアプリ開発
- [ ] 高度な分析機能
- [ ] カスタムテンプレート作成

### 長期計画（6ヶ月以上）
- [ ] AIモデルのカスタマイズ
- [ ] エンタープライズ機能
- [ ] API公開

## 📚 参考資料

- [React公式ドキュメント](https://react.dev/)
- [Vite公式ドキュメント](https://vitejs.dev/)
- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [Stripe公式ドキュメント](https://stripe.com/docs)
- [Google Gemini API](https://ai.google.dev/docs) 