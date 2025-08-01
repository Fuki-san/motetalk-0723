# MoteTalk - AI恋愛会話アシスタント

マッチングアプリ専用のAI会話アシスタント。相手のメッセージに最適な返信を3つ提案し、効果的なテンプレートメッセージを提供します。

## 🚀 機能

### 🤖 AI機能
- **AI返信生成**: Gemini-2.5-Flashを使用した自然な返信提案
- **連続対話サポート**: 会話履歴を記憶した文脈理解
- **リアルタイム処理**: 即座の返信生成と表示
- **背景状況設定**: 相手の雰囲気に合わせたパーソナライズ機能

### 💰 決済・購入システム
- **サブスクリプション**: Stripe決済による月額プレミアムプラン（¥1,980/月）
- **テンプレート購入**: 買い切りテンプレートパック（永続利用可能）
- **Webhook処理**: 自動的な購入完了処理とデータベース更新
- **解約機能**: 期間終了時の自動解約と手動解約対応

### 📝 テンプレート機能
- **初回メッセージパック**: マッチング後の最初のメッセージ15種類
- **デート誘いパック**: デートに誘うためのメッセージ15種類
- **会話ネタパック**: 会話を続けるための話題15種類

### 👤 ユーザー管理
- **Firebase認証**: 安全なユーザー認証
- **プロフィール管理**: 購入履歴とプラン管理
- **使用制限**: 無料プランとプレミアムプランの機能制限

### 📊 分析・トラッキング
- **Google Analytics 4**: ユーザー行動の詳細分析
- **イベントトラッキング**: 購入、サブスクリプション、AI使用の追跡
- **リアルタイムレポート**: アクティブユーザーとコンバージョン率の監視

## 🏗️ アーキテクチャ

### フロントエンド
- **React 18**: 最新のReact機能を活用
- **TypeScript**: 型安全な開発
- **Vite**: 高速な開発環境
- **Tailwind CSS**: モダンなスタイリング

### バックエンド
- **Node.js + Express.js**: 軽量で高速なAPI
- **Firebase Firestore**: リアルタイムデータベース
- **Stripe API**: 安全な決済処理

### 外部サービス
- **Google Gemini API**: AI返信生成（gemini-2.5-flash）
- **Stripe**: 決済処理とWebhook
- **Firebase**: 認証・データベース・ホスティング
- **Google Analytics 4**: ユーザー行動分析

## 🎯 実装完了機能

### ✅ サブスクリプションシステム（2025-01-28完了）
- **月額プレミアムプラン**: ¥1,980/月の自動課金
- **解約機能**: 期間終了時の自動解約と手動解約
- **解約予定日表示**: 具体的な解約日を表示（例：2025年2月28日）
- **Webhook処理**: `customer.subscription.deleted`イベントでの自動解約

### ✅ テンプレート購入システム（2025-07-25完了）
- **完全な購入フロー**: Stripe Checkout → Webhook → データベース更新 → フロントエンド反映
- **統一表示ロジック**: サブスク会員も無料会員も同じ体験
- **プレビュー制御**: ショップページ（プレビュー）と購入済みページ（全内容）の明確な区分
- **リアルタイム更新**: 購入後の即座反映

### ✅ AI会話システム（2025-01-28更新）
- **Gemini 2.5-Flash統合**: 最新モデルでの高品質な返信生成
- **会話履歴管理**: 文脈を理解した返信
- **使用制限**: プラン別の利用回数制限
- **背景状況設定**: 相手の雰囲気に合わせたパーソナライズ機能

### ✅ Google Analytics実装（2025-01-28完了）
- **測定ID**: G-19LCJN0VXX
- **ページビュートラッキング**: AI返信作成、テンプレート一覧、マイページ
- **イベントトラッキング**: 購入、サブスクリプション、AI返信生成、背景状況設定変更
- **リアルタイム分析**: ユーザー行動の詳細監視

### ✅ 決済システム
- **Stripe統合**: 安全な決済処理
- **Webhook処理**: 自動的な購入完了処理
- **データ整合性**: 複数データソースの同期

## 📚 ドキュメント

### 🎯 実装関連
- [✅ 実装成功記録](./docs/IMPLEMENTATION_SUCCESS.md) - テンプレート購入システムの完全実装
- [📋 テンプレート購入ロジック](./docs/TEMPLATE_PURCHASE_LOGIC.md) - 購入システムの仕組み
- [📊 開発計画・ログ](./docs/DEVELOPMENT.PLANS.md) - 最新の実装記録

### 🔧 開発・技術関連
- [📖 セットアップガイド](./docs/SETUP.md) - 開発環境の構築手順
- [🔧 技術仕様](./docs/TECHNICAL.md) - アーキテクチャと技術選定
- [💡 開発メモ](./docs/DEVELOPMENT.md) - 実装時の気づきと実験結果
- [🎨 デザインガイドライン](./docs/DESIGN.md) - UI/UXデザイン仕様
- [🔧 リファクタリングガイド](./docs/REFACTORING.md) - コード品質とリファクタリング方針

### 🚀 運用・デプロイ関連
- [🚀 デプロイガイド](./docs/DEPLOYMENT.md) - 本番環境への展開
- [🧪 テストガイド](./docs/TESTING.md) - テスト手順と結果
- [📊 トラブルシューティング](./docs/TROUBLESHOOTING.md) - よくある問題と解決策
- [🔧 開発ルール](./docs/DEVELOPMENT_RULES.md) - 開発時のルールとガイドライン

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# 開発サーバーの起動
npm run dev:full
```

詳細なセットアップ手順は [セットアップガイド](./docs/SETUP.md) を参照してください。

## 📁 プロジェクト構造

```
motetalk-fresh/
├── src/                    # フロントエンド（React + TypeScript）
│   ├── components/        # Reactコンポーネント
│   │   ├── AuthModal.tsx # 認証モーダル
│   │   ├── Dashboard.tsx # メインダッシュボード
│   │   ├── Templates.tsx # テンプレート購入・表示
│   │   ├── MyPage.tsx    # マイページ・サブスクリプション管理
│   │   └── Pricing.tsx   # プラン選択
│   ├── services/          # API統合サービス
│   │   ├── geminiService.ts    # AI返信生成
│   │   ├── stripeService.ts    # 決済処理
│   │   └── databaseService.ts  # データベース操作
│   ├── config/           # 設定ファイル
│   │   ├── analytics.ts  # Google Analytics設定
│   │   └── sentry.ts     # エラー監視設定
│   ├── hooks/            # カスタムフック
│   └── data/             # データ定義
│       └── templateData.ts # テンプレートデータ
├── server/               # バックエンド（Express.js）
│   └── index.js         # メインサーバーファイル
├── docs/                # ドキュメント
├── public/              # 静的ファイル
└── scripts/             # ユーティリティスクリプト
```

## 🧪 テスト済み機能

### ✅ サブスクリプション管理
1. **プレミアムプラン購入**: Stripe Checkoutでの月額課金
2. **解約機能**: 期間終了時の自動解約と手動解約
3. **解約予定日表示**: 購入日から1ヶ月後の具体的な日付表示
4. **Webhook処理**: `customer.subscription.deleted`イベントでの自動解約

### ✅ テンプレート購入フロー
1. **ショップページ**: テンプレートのプレビュー表示（15種類）
2. **購入処理**: Stripe Checkoutでの決済
3. **Webhook処理**: 購入完了の自動処理
4. **データベース更新**: 購入履歴とユーザー情報の更新
5. **フロントエンド反映**: 購入済みテンプレートの即座表示

### ✅ AI返信生成システム
1. **Gemini 2.5-Flash**: 最新モデルでの高品質な返信生成
2. **背景状況設定**: 相手の雰囲気に合わせたパーソナライズ
3. **使用制限**: プラン別の利用回数制限
4. **リアルタイム処理**: 即座の返信生成と表示

### ✅ Google Analytics統合
1. **ページビュートラッキング**: 各ページでの自動トラッキング
2. **イベントトラッキング**: 購入、サブスクリプション、AI使用の追跡
3. **リアルタイム分析**: アクティブユーザーとコンバージョン率の監視

### ✅ 表示ロジック
- **ショップページ**: 未購入テンプレートのプレビュー、購入済みテンプレートもプレビューのみ
- **購入済みページ**: 購入済みテンプレートの全内容表示、コピー機能
- **統一ルール**: サブスク会員も無料会員も同じ表示

### ✅ エラーハンドリング
- **Webhook署名検証**: 開発環境での適切な処理
- **null値フィルタリング**: データの整合性保証
- **ネットワークエラー**: 適切なフォールバック処理

## 🔗 関連リンク

- [✅ 実装成功記録](./docs/IMPLEMENTATION_SUCCESS.md)
- [📋 テンプレート購入ロジック](./docs/TEMPLATE_PURCHASE_LOGIC.md)
- [📊 開発計画・ログ](./docs/DEVELOPMENT.PLANS.md)
- [📖 セットアップガイド](./docs/SETUP.md)
- [🔧 技術仕様](./docs/TECHNICAL.md)
- [💡 開発メモ](./docs/DEVELOPMENT.md)
- [🚀 デプロイガイド](./docs/DEPLOYMENT.md)
- [🧪 テストガイド](./docs/TESTING.md)
- [📊 トラブルシューティング](./docs/TROUBLESHOOTING.md)

---

**最終更新**: 2025-01-28  
**実装ステータス**: ✅ サブスクリプションシステム・Google Analytics実装完了  
**次のステップ**: Stripeビジネスモード移行準備
