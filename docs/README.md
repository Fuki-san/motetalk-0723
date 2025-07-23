# MoteTalk - AI恋愛会話アシスタント

マッチングアプリ専用のAI会話アシスタント。相手のメッセージに最適な返信を3つ提案します。

## 🚀 機能

- **AI返信生成**: Gemini-2.0-Flash-001を使用した自然な返信提案
- **連続対話サポート**: 会話履歴を記憶した文脈理解
- **テンプレート集**: シーン別の効果的なメッセージテンプレート
- **サブスクリプション**: Stripe決済による月額プラン
- **買い切りテンプレート**: 一度購入すれば永続利用可能

## 🏗️ アーキテクチャ

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Node.js + Express.js
- **AI**: Google Gemini API
- **決済**: Stripe
- **認証・データベース**: Firebase
- **デプロイ**: Render

## 📚 ドキュメント

- [📖 セットアップガイド](./SETUP.md) - 開発環境の構築手順
- [🔧 技術仕様](./TECHNICAL.md) - アーキテクチャと技術選定
- [💡 開発メモ](./DEVELOPMENT.md) - 実装時の気づきと実験結果
- [🚀 デプロイガイド](./DEPLOYMENT.md) - 本番環境への展開
- [🧪 テストガイド](./TESTING.md) - テスト手順と結果
- [📊 トラブルシューティング](./TROUBLESHOOTING.md) - よくある問題と解決策

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

詳細なセットアップ手順は [セットアップガイド](./SETUP.md) を参照してください。

## 📁 プロジェクト構造

```
motetalk-cursor01-main/
├── src/                    # フロントエンド（React + TypeScript）
│   ├── components/        # Reactコンポーネント
│   ├── services/          # API統合サービス
│   ├── hooks/            # カスタムフック
│   └── config/           # 設定ファイル
├── server/               # バックエンド（Express.js）
│   └── index.js         # メインサーバーファイル
├── docs/                # ドキュメント
├── public/              # 静的ファイル
└── scripts/             # ユーティリティスクリプト
```

## 🔗 関連リンク

- [📖 セットアップガイド](./SETUP.md)
- [🔧 技術仕様](./TECHNICAL.md)
- [💡 開発メモ](./DEVELOPMENT.md)
- [🚀 デプロイガイド](./DEPLOYMENT.md)
- [🧪 テストガイド](./TESTING.md)
- [📊 トラブルシューティング](./TROUBLESHOOTING.md) 