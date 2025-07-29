# セキュリティ要件 - Stripeビジネスモード移行

## 概要
Stripeビジネスモード移行時に必要なセキュリティ要件と実装計画

## 1. 管理者画面のアクセス制限

### 現在の状況
- ❌ 管理者画面なし
- ✅ Firebase認証あり

### 実装が必要な機能

#### 1.1 管理者画面の実装
```typescript
// src/components/AdminPanel.tsx
- ユーザー管理
- 購入履歴確認
- 売上レポート
- システム設定
```

#### 1.2 IP制限
```javascript
// server/middleware/ipRestriction.js
const allowedIPs = ['xxx.xxx.xxx.xxx']; // 管理者のIP
app.use('/admin', (req, res, next) => {
  if (!allowedIPs.includes(req.ip)) {
    return res.status(403).send('Access denied');
  }
  next();
});
```

#### 1.3 2要素認証（2FA）
```typescript
// Firebase Auth + Google Authenticator
- TOTP（Time-based One-Time Password）
- QRコード生成
- バックアップコード
```

#### 1.4 アカウントロック機能
```javascript
// 10回連続失敗でロック
const loginAttempts = new Map();
const MAX_ATTEMPTS = 10;
const LOCK_DURATION = 30 * 60 * 1000; // 30分
```

### 実装優先度
- **高**: 管理者画面基本機能
- **中**: IP制限
- **低**: 2FA、アカウントロック

## 2. ファイルアップロード制限

### 現在の状況
- ✅ ファイルアップロード機能なし
- ✅ 静的ファイルのみ

### 実装が必要な場合
```javascript
// アップロード制限
const allowedExtensions = ['.jpg', '.png', '.pdf'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

// 拡張子チェック
const isValidFile = (filename, mimetype) => {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext) && allowedMimeTypes.includes(mimetype);
};
```

## 3. Webアプリケーション脆弱性対策

### 現在の実装
- ✅ HTTPS（Render自動SSL）
- ✅ 環境変数管理
- ✅ 入力値チェック（TypeScript）
- ✅ Firebase認証

### 追加実装が必要

#### 3.1 セキュリティヘッダー
```javascript
// server/index.js
app.use(helmet()); // セキュリティヘッダー
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://motetalk-0723.onrender.com']
}));
```

#### 3.2 レート制限
```javascript
// server/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // リクエスト制限
});
```

#### 3.3 入力値サニタイゼーション
```javascript
// 既に実装済み（React + TypeScript）
// 追加でDOMPurify等を検討
```

## 4. 実装計画

### Phase 1: 基本セキュリティ（即座実装可能）
1. **セキュリティヘッダー追加**
2. **レート制限実装**
3. **CORS設定**

### Phase 2: 管理者機能（1-2週間）
1. **管理者画面実装**
2. **IP制限設定**
3. **基本認証**

### Phase 3: 高度なセキュリティ（1ヶ月）
1. **2FA実装**
2. **アカウントロック機能**
3. **脆弱性診断**

## 5. 推奨アクション

### 即座に実装すべき
```bash
npm install helmet express-rate-limit
```

### 管理者画面の実装
- ユーザー管理
- 売上レポート
- システム監視

### 外部ツール導入
- **OWASP ZAP**: 脆弱性診断
- **Snyk**: 依存関係チェック
- **Sentry**: エラー監視（既に実装済み）

## 6. コスト見積もり

### 開発工数
- **Phase 1**: 1-2日
- **Phase 2**: 1-2週間
- **Phase 3**: 1ヶ月

### 外部サービス
- **OWASP ZAP**: 無料
- **Snyk**: 無料プランあり
- **Vercel/Netlify**: 無料プラン（Render代替）

## 結論

**Stripeビジネスモード移行時には最低限以下が必要：**

1. ✅ **セキュリティヘッダー追加**
2. ✅ **レート制限実装**
3. ✅ **管理者画面基本機能**
4. ✅ **IP制限設定**

**その他の機能は段階的に実装可能です。** 