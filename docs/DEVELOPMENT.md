# 開発メモ

## 🚀 最新の学び（2025-07-24）

### SPAキャッシュ問題の根本的解決

#### 問題の背景
- ブラウザが古いビルドファイル名をキャッシュしている
- 静的ファイル配信の順序が不適切
- path-to-regexpエラーによるサーバー起動失敗

#### 解決策の実装

##### 1. 動的HTML生成
```javascript
// 現在のビルドファイルを自動検出
const distFiles = fs.readdirSync(path.join(__dirname, '../dist'));
const jsFile = distFiles.find(file => file.endsWith('.js') && file.startsWith('index-'));
const cssFile = distFiles.find(file => file.endsWith('.css') && file.startsWith('index-'));

// キャッシュバスティング付きでHTMLを更新
const timestamp = Date.now();
htmlContent = htmlContent.replace(
  /src="\/index-[^"]+\.js"/g,
  `src="/${jsFile}?v=${timestamp}"`
);
```

##### 2. 静的ファイル配信の最適化
```javascript
// index.htmlを除外して動的生成を優先
app.use((req, res, next) => {
  if (req.path.match(/\/index-.*\.js/)) {
    // JSファイルの配信
    return express.static(staticPath)(req, res, next);
  }
  next();
});
```

##### 3. 強力なキャッシュ制御
```javascript
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
```

#### 重要な学び

1. **問題の真の原因を特定する重要性**
   - 表面的なエラーメッセージだけでなく、根本原因を追求
   - ブラウザキャッシュが主な原因だった

2. **段階的なデバッグの効果**
   - ローカルテストで問題を早期発見
   - 小さな修正を積み重ねて解決

3. **静的ファイル配信の順序の重要性**
   - `express.static`の配置順序が重要
   - 動的生成と静的配信の競合を回避

4. **キャッシュバスティングの効果**
   - タイムスタンプ付きURLで確実にキャッシュを無効化
   - ブラウザの厳格なキャッシュ制御に対応

#### 今後の改善点

1. **本番環境でのキャッシュ戦略**
   - 適切なキャッシュ期間の設定
   - CDNとの連携

2. **ビルドプロセスの最適化**
   - ファイル名の一貫性確保
   - 不要なファイルの削除

3. **監視とログの強化**
   - エラー検知の自動化
   - パフォーマンス監視

#### 重要な学び（2025-07-24 追加）

##### 1. Clear-Site-Dataヘッダーの危険性
- **問題**: `Clear-Site-Data: "cache", "cookies", "storage"`が認証状態をリセット
- **解決**: 認証が必要なアプリではこのヘッダーを削除
- **教訓**: キャッシュ制御と認証状態の両立を考慮

##### 2. Gemini API 503エラーの適切な処理
- **問題**: 一時的な過負荷状態でのエラー
- **解決**: リトライ機能と指数バックオフの実装
- **教訓**: 外部APIの信頼性を前提としない設計

##### 3. 決済フローでのユーザー体験
- **問題**: 決済完了後の不適切なリダイレクト
- **解決**: 購入タイプに応じた自動リダイレクト
- **教訓**: ユーザーの期待する動作を事前に設計

MoteTalkプロジェクトの開発過程での気づき、実験結果、トラブルシューティングの記録です。

## 📝 開発ログ

### 2024年7月23日 - 静的ファイル配信の問題解決

#### 問題
```
Refused to apply style from 'https://motetalk-0723.onrender.com/index-D4L134hE.css' because its MIME type ('text/html') is not a supported stylesheet MIME type
```

#### 原因分析
1. **ブラウザキャッシュの問題**: 古いファイル名を参照していた
2. **静的ファイル配信の順序**: `express.static`の設定が正しく動作していない
3. **MIMEタイプの設定**: ファイルが見つからない場合に`index.html`が返される

#### 解決策
1. **ブラウザキャッシュのクリア**: `Cmd+Shift+R`でスーパーリロード
2. **静的ファイル配信の改善**: 専用の404ハンドラーを追加
3. **ログの追加**: デバッグ用のコンソールログを追加

#### 学んだこと
- Express.jsの静的ファイル配信の順序が重要
- ブラウザキャッシュが開発に大きな影響を与える
- ログによる問題の特定が効果的

### 2024年7月23日 - path-to-regexpエラーの解決

#### 問題
```
TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
```

#### 原因
- Express.jsの最新バージョンで`app.get('*', ...)`が`path-to-regexp`ライブラリで正しく処理されない

#### 解決策
- `app.get('*', ...)`を`app.use()`に変更
- ミドルウェアベースのルーティングに変更

#### 学んだこと
- Express.jsのルーティングパターンはバージョンによって動作が異なる
- ミドルウェアベースのアプローチがより安全

## 🧪 実験結果

### AI返信生成の品質テスト

#### テストケース1: 初回メッセージ
**入力**: "こんにちは！プロフィール見させてもらいました😊"
**期待結果**: 自然で親しみやすい返信3つ

**結果**:
1. "こんにちは！ありがとうございます😊 プロフィール見てくれて嬉しいです！"
2. "こんにちは〜！ありがとうございます😊 どんなところが印象的でしたか？"
3. "こんにちは！ありがとうございます😊 お互いのことをもっと知れたらいいですね"

**評価**: ✅ 期待通りの自然な返信が生成された

#### テストケース2: デート誘い
**入力**: "今度一緒にご飯でもどう？"
**期待結果**: 適度に積極的で自然な返信

**結果**:
1. "いいですね！どんなお店がお気に入りですか？😊"
2. "ぜひ！いつ頃がお互い都合良さそうですか？"
3. "ありがとうございます！楽しみにしています😊"

**評価**: ✅ 適切な積極性と自然さのバランス

### 決済フローのテスト

#### Stripe決済テスト
**テスト項目**:
- サブスクリプション決済
- テンプレート購入
- Webhook受信

**結果**:
- ✅ サブスクリプション決済: 正常
- ✅ テンプレート購入: 正常
- ✅ Webhook受信: 正常
- ⚠️ 購入後のUI更新: 要改善

#### 学んだこと
- Stripe Webhookの処理が重要
- フロントエンドとバックエンドの状態同期が課題

## 💡 実装時の気づき

### React + TypeScript

#### 型安全性の重要性
```typescript
// 良い例: 型安全なインターフェース
interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 悪い例: any型の使用
const conversation: any[] = [];
```

**学んだこと**: 型定義によりバグを早期発見できる

#### カスタムフックの活用
```typescript
// useAuthフックの実装
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
```

**学んだこと**: カスタムフックによりロジックの再利用性が向上

### Firebase

#### リアルタイムデータの活用
```typescript
// リアルタイムリスナーの実装
const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
  if (doc.exists()) {
    setUserData(doc.data());
  }
});
```

**学んだこと**: リアルタイム更新によりUXが大幅に向上

#### セキュリティルールの重要性
```javascript
// Firestoreセキュリティルール
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**学んだこと**: 適切なセキュリティルールが必須

### Stripe

#### Webhook処理の重要性
```javascript
// Webhook署名検証
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
```

**学んだこと**: Webhookの署名検証がセキュリティ上重要

#### エラーハンドリング
```javascript
try {
  const session = await stripe.checkout.sessions.create(config);
  res.json({ sessionId: session.id, url: session.url });
} catch (error) {
  console.error('Stripe error:', error);
  res.status(500).json({ error: error.message });
}
```

**学んだこと**: 適切なエラーハンドリングがユーザー体験に直結

## 🚨 トラブルシューティング記録

### 問題1: Firebase認証エラー

#### 症状
```
Firebase: Error (auth/unauthorized-domain).
```

#### 原因
- 承認済みドメインに`localhost`が含まれていない

#### 解決策
1. Firebase Consoleで承認済みドメインを確認
2. `localhost`を追加
3. 開発環境のドメインも追加

### 問題2: Stripe決済エラー

#### 症状
```
Stripe: No such price: 'price_xxx'
```

#### 原因
- 動的価格設定を使用していた
- 実際のStripe Price IDを使用していない

#### 解決策
1. Stripe Dashboardで実際のPrice IDを確認
2. コード内で実際のPrice IDを使用
3. テストモードと本番モードの区別を明確化

### 問題3: 静的ファイル配信エラー

#### 症状
```
MIME type ('text/html') is not a supported stylesheet MIME type
```

#### 原因
- 静的ファイルが見つからない場合に`index.html`が返される
- ブラウザキャッシュの問題

#### 解決策
1. 静的ファイル配信の順序を修正
2. 専用の404ハンドラーを追加
3. ブラウザキャッシュのクリア

## 📊 パフォーマンス最適化

### バンドルサイズの最適化

#### 問題
- バンドルサイズが759KBと大きい
- 初回読み込み時間が長い

#### 対策
```typescript
// 動的インポートによる遅延読み込み
const Dashboard = lazy(() => import('./components/Dashboard'));
const Templates = lazy(() => import('./components/Templates'));
```

#### 結果
- 初期バンドルサイズを削減
- 必要な時だけコンポーネントを読み込み

### 画像最適化

#### 問題
- アイコンがSVG形式でない
- ファビコンが404エラー

#### 対策
1. SVGアイコンの使用
2. 適切なファビコン設定
3. 画像の圧縮

## 🔮 将来の改善点

### 短期改善（1-2週間）
- [ ] エラーハンドリングの強化
- [ ] ローディング状態の改善
- [ ] レスポンシブデザインの最適化

### 中期改善（1-2ヶ月）
- [ ] パフォーマンス監視の導入
- [ ] テストカバレッジの向上
- [ ] CI/CDパイプラインの構築

### 長期改善（3-6ヶ月）
- [ ] モバイルアプリの開発
- [ ] 高度な分析機能
- [ ] 多言語対応

## 📚 参考資料

- [React Best Practices](https://react.dev/learn)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Express.js Static Files](https://expressjs.com/en/starter/static-files.html) 