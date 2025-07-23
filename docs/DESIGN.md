# 🎨 デザインガイドライン

## 🎯 デザインコンセプト

### ブランドカラー
- **プライマリ**: グラデーション `from-purple-600 to-blue-600`
- **セカンダリ**: `gray-600`, `gray-800`
- **アクセント**: `purple-100`, `blue-50`
- **背景**: `from-purple-50 via-blue-50 to-indigo-100`

### デザイン原則
1. **モダンでクリーン**: 余白を活かした洗練されたデザイン
2. **ユーザーフレンドリー**: 直感的で使いやすいインターフェース
3. **レスポンシブ**: すべてのデバイスで最適な体験
4. **アクセシビリティ**: 色覚障害者にも配慮したデザイン

## 🧩 コンポーネント仕様

### 1. カードコンポーネント
```typescript
// 基本スタイル
className="bg-white rounded-2xl shadow-xl p-6"

// バリエーション
- 通常カード: `bg-white`
- グラデーションカード: `bg-gradient-to-r from-purple-50 to-blue-50`
- 警告カード: `bg-yellow-50 border border-yellow-200`
- エラーカード: `bg-red-50 border border-red-200`
```

### 2. ボタンデザイン
```typescript
// プライマリボタン
className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"

// セカンダリボタン
className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"

// 危険ボタン
className="bg-red-100 text-red-700 px-6 py-3 rounded-lg font-medium hover:bg-red-200 transition-all duration-200"
```

### 3. アイコンデザイン
```typescript
// アイコンサイズ
- 小: `w-4 h-4`
- 中: `w-6 h-6`
- 大: `w-8 h-8`
- 特大: `w-12 h-12`

// アイコンカラー
- プライマリ: `text-purple-600`
- セカンダリ: `text-gray-600`
- アクセント: `text-blue-600`
- 成功: `text-green-500`
- 警告: `text-yellow-500`
- エラー: `text-red-500`
```

### 4. タイポグラフィ
```typescript
// 見出し
- H1: `text-3xl font-bold text-gray-800`
- H2: `text-2xl font-bold text-gray-800`
- H3: `text-xl font-semibold text-gray-800`

// 本文
- 通常: `text-gray-600`
- 強調: `text-gray-800 font-medium`
- 小さめ: `text-sm text-gray-500`
```

## 📱 レスポンシブデザイン

### ブレークポイント
```css
/* Tailwind CSS ブレークポイント */
sm: 640px   /* スマートフォン */
md: 768px   /* タブレット */
lg: 1024px  /* デスクトップ */
xl: 1280px  /* 大画面 */
2xl: 1536px /* 超大画面 */
```

### レイアウトパターン
```typescript
// フレックスレイアウト
className="flex flex-col lg:flex-row gap-8"

// グリッドレイアウト
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// 中央配置
className="flex items-center justify-center min-h-screen"
```

## 🎨 ページ別デザイン仕様

### 1. ダッシュボード
- **レイアウト**: 2カラム（サイドバー + メインコンテンツ）
- **カラーテーマ**: グラデーション背景
- **コンポーネント**: チャットインターフェース、設定パネル

### 2. テンプレートページ
- **レイアウト**: 3カラム（カテゴリ + プレビュー + 詳細）
- **カラーテーマ**: カードベースのレイアウト
- **コンポーネント**: テンプレートカード、購入ボタン

### 3. マイページ
- **レイアウト**: タブベースのレイアウト
- **カラーテーマ**: プロフィール重視のデザイン
- **コンポーネント**: 設定フォーム、購入履歴

### 4. 認証モーダル
- **レイアウト**: モーダルウィンドウ
- **カラーテーマ**: フォーカスされたデザイン
- **コンポーネント**: フォーム、ソーシャルログイン

## 🎭 アニメーション

### トランジション
```typescript
// 基本トランジション
className="transition-all duration-200"

// ホバーエフェクト
className="hover:scale-105 hover:shadow-2xl transition-all duration-200"

// フェードイン
className="animate-fade-in"
```

### ローディング
```typescript
// スピナー
className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"

// スケルトン
className="animate-pulse bg-gray-200 rounded"
```

## 🎨 カラーパレット

### メインカラー
```css
/* Purple */
purple-50: #faf5ff
purple-100: #f3e8ff
purple-600: #9333ea
purple-700: #7c3aed

/* Blue */
blue-50: #eff6ff
blue-100: #dbeafe
blue-600: #2563eb
blue-700: #1d4ed8

/* Gray */
gray-50: #f9fafb
gray-100: #f3f4f6
gray-600: #4b5563
gray-800: #1f2937
```

### セマンティックカラー
```css
/* Success */
green-500: #10b981
green-50: #ecfdf5

/* Warning */
yellow-500: #f59e0b
yellow-50: #fffbeb

/* Error */
red-500: #ef4444
red-50: #fef2f2
```

## 📐 スペーシング

### マージン・パディング
```typescript
// コンテナ
className="px-4 sm:px-6 lg:px-8 py-8"

// カード
className="p-6"

// セクション間
className="space-y-6"

// アイテム間
className="space-x-4"
```

## 🔧 実装ガイドライン

### 1. コンポーネント設計
- **単一責任**: 1つのコンポーネントは1つの役割
- **再利用性**: 汎用的なコンポーネントを作成
- **型安全性**: TypeScriptで型定義を厳密に

### 2. スタイリング
- **Tailwind CSS**: ユーティリティファースト
- **カスタムCSS**: 最小限に抑える
- **レスポンシブ**: モバイルファースト

### 3. アクセシビリティ
- **ARIA属性**: 適切なラベルとロール
- **キーボードナビゲーション**: フォーカス管理
- **色のコントラスト**: WCAG準拠

### 4. パフォーマンス
- **遅延読み込み**: 大きなコンポーネント
- **メモ化**: 不要な再レンダリングを防ぐ
- **バンドル最適化**: コード分割

## 📱 デバイス別対応

### スマートフォン
- タッチフレンドリーなボタンサイズ
- スワイプジェスチャーのサポート
- 縦スクロール最適化

### タブレット
- 2カラムレイアウトの活用
- タッチとマウスの両方に対応
- 画面回転への対応

### デスクトップ
- マウスホバーエフェクト
- キーボードショートカット
- 大画面での情報密度最適化

## 🎨 デザインシステム

### コンポーネントライブラリ
```typescript
// 共通コンポーネント
- Button
- LoadingSpinner
- Modal
- Card
- Input
- Select
- Toggle
```

### アイコンライブラリ
```typescript
// Lucide React
- MessageCircle
- Sparkles
- User
- Crown
- Settings
- Copy
- Check
- Lock
```

## 📋 品質チェックリスト

### デザイン品質
- [ ] ブランドカラーの一貫性
- [ ] タイポグラフィの統一
- [ ] スペーシングの適切性
- [ ] レスポンシブ対応
- [ ] アクセシビリティ対応

### 実装品質
- [ ] TypeScript型定義
- [ ] エラーハンドリング
- [ ] パフォーマンス最適化
- [ ] テストカバレッジ
- [ ] ドキュメント整備 