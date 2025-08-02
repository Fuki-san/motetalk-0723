# MoteTalk LP作成プロンプト

## プロジェクト概要

**MoteTalk** - マッチングアプリ専用のAI恋愛会話アシスタント

### サービス特徴
- 🤖 **AI返信生成**: Gemini 2.5-Flashで自然な返信を3つ提案
- 📝 **テンプレート購入**: 初回メッセージ・デート誘い・会話ネタ（各15種類）
- 💰 **サブスクリプション**: 月額¥1,980のプレミアムプラン
- 🔒 **セキュア**: Firebase認証、Stripe決済、HTTPS対応

### ターゲット
- マッチングアプリユーザー（Tinder、タップル等）
- 返信に困っている人
- 恋愛の成功率を上げたい人

## 技術仕様

### 推奨構成
```bash
# Next.js + Vercel（最推奨）
npx create-next-app@latest motetalk-lp --typescript --tailwind --app

# 必要なパッケージ
npm install lucide-react framer-motion @vercel/analytics
```

### プロジェクト構造
```
motetalk-lp/
├── app/
│   ├── page.tsx          # ホームページ
│   ├── pricing.tsx       # 料金ページ
│   ├── features.tsx      # 機能紹介
│   └── contact.tsx       # お問い合わせ
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   ├── FAQ.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── lib/
│   └── analytics.ts      # Google Analytics
└── public/
    └── images/
```

## デザイン仕様

### ブランドカラー
```css
/* メインカラー */
--primary: #6b46c1;     /* 紫 */
--secondary: #3b82f6;   /* 青 */
--accent: #8b5cf6;      /* ライト紫 */

/* グラデーション */
background: linear-gradient(135deg, #6b46c1 0%, #3b82f6 100%);
```

### タイポグラフィ
```css
/* フォント */
font-family: 'Inter', sans-serif;

/* 見出し */
h1: 3rem (48px) - 4rem (64px)
h2: 2rem (32px) - 2.5rem (40px)
h3: 1.5rem (24px) - 2rem (32px)
```

### アイコン
```typescript
// Lucide React
import { MessageCircle, Sparkles, Crown, Star, Heart, ArrowRight } from 'lucide-react';
```

## セクション構成

### 1. ヒーローセクション
```typescript
// キャッチコピー
"マッチングアプリで返信に困ったことはありませんか？"
"AIが最適な返信を3つ提案する恋愛アシスタント"

// CTAボタン
"無料で始める" → メインアプリへ
"機能を見る" → スクロール
```

### 2. 機能紹介セクション
```typescript
const features = [
  {
    icon: Sparkles,
    title: "AI返信生成",
    description: "Gemini 2.5-Flashで自然な返信を3つ提案",
    highlight: "相手の雰囲気に合わせてパーソナライズ"
  },
  {
    icon: MessageCircle,
    title: "テンプレート購入",
    description: "初回メッセージ・デート誘い・会話ネタ",
    highlight: "各15種類の効果的なテンプレート"
  },
  {
    icon: Crown,
    title: "プレミアムプラン",
    description: "月額¥1,980で無制限利用",
    highlight: "恋愛の成功率を劇的に向上"
  }
];
```

### 3. 料金プランセクション
```typescript
const plans = [
  {
    name: "無料プラン",
    price: "¥0",
    features: [
      "AI返信生成 5回/日",
      "テンプレートプレビュー",
      "基本機能利用"
    ],
    cta: "無料で始める"
  },
  {
    name: "プレミアムプラン",
    price: "¥1,980",
    period: "/月",
    features: [
      "AI返信生成 無制限",
      "テンプレート購入可能",
      "優先サポート",
      "背景状況設定"
    ],
    cta: "プレミアムにアップグレード",
    popular: true
  }
];
```

### 4. FAQセクション
```typescript
const faqs = [
  {
    question: "AI返信は自然ですか？",
    answer: "Gemini 2.5-Flashを使用し、相手の雰囲気に合わせた自然な返信を生成します。"
  },
  {
    question: "テンプレートは永続利用可能ですか？",
    answer: "はい、購入したテンプレートは永続的に利用できます。"
  },
  {
    question: "解約はいつでも可能ですか？",
    answer: "はい、いつでも解約可能です。期間終了までサービスをご利用いただけます。"
  },
  {
    question: "プライバシーは保護されていますか？",
    answer: "Firebase認証とHTTPS通信で、あなたのプライバシーを完全に保護します。"
  }
];
```

## 実装手順

### Step 1: プロジェクト作成
```bash
npx create-next-app@latest motetalk-lp --typescript --tailwind --app
cd motetalk-lp
npm install lucide-react framer-motion @vercel/analytics
```

### Step 2: 基本設定
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <title>MoteTalk - AI恋愛会話アシスタント</title>
        <meta name="description" content="マッチングアプリ専用のAI会話アシスタント。相手のメッセージに最適な返信を3つ提案します。" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Step 3: コンポーネント実装
```typescript
// components/Hero.tsx
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          マッチングアプリで返信に困ったことはありませんか？
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          AIが最適な返信を3つ提案する恋愛アシスタント
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            無料で始める
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
            機能を見る
          </button>
        </div>
      </div>
    </section>
  );
}
```

### Step 4: アニメーション追加
```typescript
// components/Features.tsx
import { motion } from 'framer-motion';

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            機能紹介
          </h2>
          <p className="text-xl text-gray-600">
            AIがあなたの恋愛をサポートします
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <p className="text-purple-600 font-medium">{feature.highlight}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

## デプロイ設定

### Vercelデプロイ
```bash
# ビルド
npm run build

# デプロイ
vercel --prod
```

### 環境変数
```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-19LCJN0VXX
NEXT_PUBLIC_APP_URL=https://motetalk-0723.onrender.com
```

## SEO・マーケティング

### メタタグ
```html
<title>MoteTalk - AI恋愛会話アシスタント</title>
<meta name="description" content="マッチングアプリ専用のAI会話アシスタント。相手のメッセージに最適な返信を3つ提案します。" />
<meta name="keywords" content="AI,恋愛,マッチングアプリ,返信,テンプレート" />
<meta property="og:title" content="MoteTalk - AI恋愛会話アシスタント" />
<meta property="og:description" content="マッチングアプリ専用のAI会話アシスタント" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://motetalk-lp.vercel.app" />
```

### Google Analytics
```typescript
// lib/analytics.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const pageview = (url: string) => {
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

## 完了チェックリスト

- [ ] プロジェクト作成
- [ ] 基本レイアウト実装
- [ ] ヒーローセクション
- [ ] 機能紹介セクション
- [ ] 料金プランセクション
- [ ] FAQセクション
- [ ] お問い合わせフォーム
- [ ] フッター
- [ ] アニメーション追加
- [ ] レスポンシブ対応
- [ ] SEO設定
- [ ] Google Analytics設定
- [ ] Vercelデプロイ
- [ ] ドメイン設定

## 注意事項

1. **メインアプリとの連携**: CTAボタンでメインアプリ（https://motetalk-0723.onrender.com）へ誘導
2. **ブランド統一**: メインアプリと同じカラーパレットとデザイン
3. **パフォーマンス**: 画像最適化、遅延読み込み
4. **アクセシビリティ**: 適切なalt属性、キーボードナビゲーション
5. **モバイルファースト**: スマートフォンでの表示を最優先

---

**このプロンプトをCursorに投げて、美しく機能的なLPを作成してください！** 🚀 