# 🔧 リファクタリングガイド

## 📋 完了したリファクタリング

### 1. 不要ファイルの削除
- `.DS_Store` ファイルの削除
- ログファイルの削除
- 重複したテンプレートデータの削除

### 2. 共通ユーティリティの抽出

#### 認証関連 (`src/services/authUtils.ts`)
```typescript
// 共通の認証トークン取得
export const getAuthToken = async (): Promise<string>

// 共通のAPI呼び出しヘルパー
export const apiCall = async <T>(url: string, options?: RequestInit): Promise<T>
```

#### ログ出力 (`src/utils/logger.ts`)
```typescript
// 環境に応じたログ出力制御
export const logger = {
  log, error, warn, info
}
```

### 3. データの分離

#### テンプレートデータ (`src/data/templateData.ts`)
- 重複したテンプレートデータを分離
- 型定義の統一
- 再利用可能な構造

#### 共通型定義 (`src/types/index.ts`)
- ユーザー関連の型
- 会話関連の型
- 使用量関連の型
- 設定関連の型
- API レスポンス関連の型

### 4. 共通コンポーネントの作成

#### LoadingSpinner (`src/components/common/LoadingSpinner.tsx`)
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}
```

#### Button (`src/components/common/Button.tsx`)
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
  // ...
}
```

### 5. サービス層のリファクタリング

#### EmailNotificationService
- 共通の `apiCall` を使用
- 重複した認証ロジックを削除
- エラーハンドリングの統一

#### StripeService
- 共通の `getAuthToken` を使用
- デバッグログの整理

## 🚫 今後避けるべきこと

### 1. 重複コードの作成
- 認証トークン取得は `authUtils.ts` を使用
- API呼び出しは `apiCall` を使用
- ログ出力は `logger` を使用

### 2. 大きなファイルの作成
- コンポーネントは500行以下を目標
- データとロジックは分離
- 共通部分は抽出

### 3. 型定義の重複
- 新しい型は `src/types/index.ts` に追加
- 既存の型を再利用
- インターフェースの統一

## ✅ 今後の開発ガイドライン

### 1. ファイル構造
```
src/
├── components/
│   ├── common/          # 共通コンポーネント
│   └── [feature]/       # 機能別コンポーネント
├── services/            # API呼び出し
├── hooks/              # カスタムフック
├── utils/              # ユーティリティ
├── types/              # 型定義
├── data/               # 静的データ
└── config/             # 設定
```

### 2. 命名規則
- コンポーネント: PascalCase (`LoadingSpinner`)
- ファイル: kebab-case (`loading-spinner.tsx`)
- 関数: camelCase (`getAuthToken`)
- 定数: UPPER_SNAKE_CASE (`API_BASE_URL`)

### 3. コード品質
- TypeScriptの厳密な型チェック
- ESLintルールの遵守
- 適切なエラーハンドリング
- 環境に応じたログ出力

### 4. パフォーマンス
- 不要な再レンダリングの回避
- メモ化の適切な使用
- バンドルサイズの最適化

## 🔄 定期的なリファクタリング

### 月次チェック項目
- [ ] 重複コードの確認
- [ ] 大きなファイルの分割
- [ ] 未使用コードの削除
- [ ] 型定義の整理
- [ ] パフォーマンスの測定

### リファクタリングのタイミング
- 新機能追加時
- バグ修正時
- コードレビュー時
- 月次メンテナンス時

## 📚 参考資料

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Tailwind CSS Guidelines](https://tailwindcss.com/docs) 