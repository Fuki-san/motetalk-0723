import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// メール配信サービス設定
const EMAIL_SERVICE_CONFIG = {
  // 実際の実装では SendGrid, AWS SES, Nodemailer などを使用
  enabled: process.env.NODE_ENV === 'production',
  fromEmail: 'noreply@motetalk.com',
  supportEmail: 'support@motetalk.com'
};

// メールテンプレート生成
function generateEmailTemplate(type, data) {
  if (!EMAIL_SERVICE_CONFIG.enabled) {
    return null;
  }

  const templates = {
    subscription_canceled: {
      subject: 'MoteTalk サブスクリプション解約のお知らせ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b46c1;">MoteTalk サブスクリプション解約のお知らせ</h2>
          <p>${data.name}様</p>
          <p>MoteTalkをご利用いただき、ありがとうございました。</p>
          <p>サブスクリプションが解約されました。課金期間終了日（${data.periodEnd}）までサービスをご利用いただけます。</p>
          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          <p>MoteTalk サポートチーム</p>
        </div>
      `,
      text: `
MoteTalk サブスクリプション解約のお知らせ

${data.name}様

MoteTalkをご利用いただき、ありがとうございました。

サブスクリプションが解約されました。課金期間終了日（${data.periodEnd}）までサービスをご利用いただけます。

ご不明な点がございましたら、お気軽にお問い合わせください。

MoteTalk サポートチーム
      `
    },
    template_purchased: {
      subject: 'MoteTalk テンプレート購入完了のお知らせ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b46c1;">MoteTalk テンプレート購入完了</h2>
          <p>${data.name}様</p>
          <p>${data.templateName}の購入が完了しました。</p>
          <p>テンプレートページからすぐにご利用いただけます。</p>
          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          <p>MoteTalk サポートチーム</p>
        </div>
      `,
      text: `
MoteTalk テンプレート購入完了

${data.name}様

${data.templateName}の購入が完了しました。

テンプレートページからすぐにご利用いただけます。

ご不明な点がございましたら、お気軽にお問い合わせください。

MoteTalk サポートチーム
      `
    }
  };

  return templates[type] || null;
}

// メール送信関数
async function sendEmail(to, subject, html, text) {
  if (!EMAIL_SERVICE_CONFIG.enabled) {
    console.log('📧 メール送信（開発環境のためスキップ）:', { to, subject });
    return;
  }

  try {
    // 実際の実装では SendGrid, AWS SES, Nodemailer などを使用
    console.log('📧 メール送信:', { to, subject });
    // ここに実際のメール送信処理を実装
  } catch (error) {
    console.error('❌ メール送信エラー:', error);
  }
}

// 環境変数のデバッグ情報を出力
console.log('🔍 環境変数チェック:', {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ 設定済み' : '❌ 未設定',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? '✅ 設定済み' : '❌ 未設定',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? '✅ 設定済み' : '❌ 未設定',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? '✅ 設定済み' : '❌ 未設定',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001
});

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY が設定されていません！');
  console.error('📝 .envファイルを確認してください');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Firebase Admin初期化
let db;
try {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('❌ Firebase環境変数が不完全です');
    console.error('必要な変数: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  } else {
    // 既存のアプリをクリア
    if (admin.apps.length > 0) {
      admin.app().delete();
    }
    
    // 新しいアプリを初期化
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
    
    console.log('🔍 Firebase Admin初期化設定:', {
      projectId: serviceAccount.projectId,
      clientEmail: serviceAccount.clientEmail,
      privateKeyLength: serviceAccount.privateKey.length
    });
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    db = admin.firestore();
    
    console.log('✅ Firebase Admin SDK初期化完了');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK初期化エラー:', error.message);
  console.error('📝 Firebase Console で Service Account キーを確認してください');
  db = null;
}


const app = express();
const PORT = process.env.PORT || 3001;

// セキュリティヘッダーの設定（開発環境では緩和）
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // 本番環境では基本的なセキュリティヘッダーのみ
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Cross-Origin-Opener-Policyを緩和してGoogleログインを許可
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
  next();
});

// 静的ファイルの配信設定
const staticPath = path.join(__dirname, '../dist');
app.use(express.static(staticPath, {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // JavaScriptファイルのMIMEタイプを正しく設定
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    // CSSファイルのMIMEタイプを設定
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
}));

// デバッグ用ログ
console.log('📁 静的ファイルパス:', staticPath);
console.log('🔍 静的ファイル存在確認:', fs.existsSync(path.join(staticPath, 'index.html')));
console.log('📁 静的ファイル一覧:', fs.readdirSync(staticPath));

// APIルートのプレフィックス
app.use('/api', cors());

// JWT認証ミドルウェア
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    if (!admin.apps.length) {
      console.error('❌ Firebase Admin not initialized');
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }
    
    // Firebase ID Tokenを検証
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // ユーザー情報をリクエストに追加
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email
    };
    
    next();
    
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// 認証が必要なエンドポイント用のミドルウェア
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// 開発環境でのログ強化
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Middleware
app.use(cors());
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// 静的ファイルの配信設定（APIルートの前に配置）
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, path) => {
    console.log(`📁 Serving static file: ${path}`);
    // CSSファイルのMIMEタイプを設定
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    // JSファイルのMIMEタイプを設定
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    // SVGファイルのMIMEタイプを設定
    if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    // その他のファイルタイプ
    if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    if (path.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    }
  },
  maxAge: '1y' // キャッシュ設定
}));

// 静的ファイルが見つからない場合の404ハンドラー
app.use((req, res, next) => {
  // 静的ファイルの拡張子をチェック
  const staticExtensions = ['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  const hasStaticExtension = staticExtensions.some(ext => req.path.endsWith(ext));
  
  if (hasStaticExtension) {
    // 静的ファイルが見つからない場合は404エラーを返す
    console.log(`❌ Static file not found: ${req.path}`);
    return res.status(404).send('Static file not found');
  }
  
  next();
});

// Stripe Checkout Session作成
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('🛒 Checkout session作成リクエスト:', req.body);
    
    const { type, planId, templateId, successUrl, cancelUrl } = req.body;

    let sessionConfig = {
      payment_method_types: ['card'],
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    if (type === 'subscription') {
      // サブスクリプション設定 - 実際のPrice IDを使用
      const priceIds = {
        premium_monthly: 'price_1Rl6VZQoDVsMq3SiLcu7GnkA' // 1,980円/月
      };

      sessionConfig.mode = 'subscription';
      sessionConfig.line_items = [{
        price: priceIds[planId],
        quantity: 1,
      }];
    } else if (type === 'one_time') {
      // 買い切り購入設定 - 実際のPrice IDを使用
      const priceIds = {
        first_message_pack: 'price_1Rl6WZQoDVsMq3SibYnakW14', // 2,500円
        line_transition_pack: 'price_1Rl6WZQoDVsMq3SibYnakW14', // 2,500円
        date_invitation_pack: 'price_1Rl6WZQoDVsMq3SibYnakW14', // 2,500円
        conversation_topics_pack: 'price_1Rl6WZQoDVsMq3SibYnakW14' // 2,500円
      };

      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [{
        price: priceIds[templateId],
        quantity: 1,
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('✅ Checkout session作成成功:', session.id);
    
    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('❌ Checkout session作成エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

// 購入状況確認
app.get('/api/check-purchase-status', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    res.json({
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      type: session.mode === 'subscription' ? 'subscription' : 'one_time',
      amount_total: session.amount_total
    });

  } catch (error) {
    console.error('Purchase status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// サブスクリプション解約
app.post('/api/cancel-subscription', authenticateUser, requireAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    // ユーザーのサブスクリプションIDを取得
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    const subscriptionId = userData.subscriptionId;
    
    if (!subscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }
    
    // Stripeでサブスクリプションを期間終了時に解約
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
    
    // Firestoreのユーザー情報を更新
    await db.collection('users').doc(userId).update({
      subscriptionStatus: 'cancel_at_period_end',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('🔄 サブスクリプション解約リクエスト受信');
    
    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      cancelAt: subscription.cancel_at
    });

  } catch (error) {
    console.error('❌ Subscription cancellation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ユーザー情報取得（デモ用）
app.get('/api/user-profile', authenticateUser, requireAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    if (!db) {
      // Firebase未初期化時のフォールバック
      const userProfile = {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
        plan: 'free',
        subscriptionStatus: null,
        purchasedTemplates: []
      };
      return res.json(userProfile);
    }
    
    // Firestoreからユーザー情報を取得
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // ユーザーが存在しない場合は新規作成
      const newUserProfile = {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
        plan: 'free',
        subscriptionStatus: null,
        purchasedTemplates: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('users').doc(userId).set(newUserProfile);
      console.log('✅ 新規ユーザー作成:', req.user.email);
      
      return res.json({
        ...newUserProfile,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    const userProfile = {
      uid: userId,
      ...userDoc.data()
    };
    
    res.json(userProfile);

  } catch (error) {
    console.error('User profile fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ユーザー設定更新
app.post('/api/user-settings', authenticateUser, requireAuth, async (req, res) => {
  try {
    const { settings } = req.body;
    const userId = req.user.uid;
    
    console.log('⚙️ ユーザー設定更新:', settings);
    
    // 設定に応じた処理を実行
    if (settings.notifications?.email) {
      console.log('📧 メール通知リストに追加');
      // メール配信サービスに登録
    }
    
    if (settings.notifications?.push) {
      console.log('🔔 プッシュ通知を設定');
      // プッシュ通知サービスに登録
    }
    
    if (!settings.privacy?.saveConversationHistory) {
      console.log('🗑️ 会話履歴削除処理');
      // 実際の会話履歴削除処理（インデックスエラー回避のためwhereを削除）
      if (db) {
        const conversationsQuery = await db.collection('conversations').get();
        const userConversations = conversationsQuery.docs.filter(doc => doc.data().userId === userId);
        const deletePromises = userConversations.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        console.log('✅ 会話履歴削除完了:', userConversations.length, '件');
      }
    }
    
    // Firestoreに設定を保存
    if (db) {
      await db.collection('users').doc(userId).update({
        settings: settings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ ユーザー設定をFirestoreに保存:', userId);
    }
    
    res.json({ success: true, message: '設定が更新されました' });

  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 使用回数制限チェックAPI
app.get('/api/usage-limit', authenticateUser, requireAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // データベースが利用できない場合はデフォルト値を返す
    if (!db) {
      return res.json({
        canUse: true,
        remainingUses: 3,
        totalUses: 3,
        plan: 'free'
      });
    }
    
    try {
      // ユーザー情報を取得
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        // 新規ユーザーの場合、初期データを作成
        await db.collection('users').doc(userId).set({
          uid: userId,
          email: req.user.email,
          name: req.user.name,
          plan: 'free',
          monthlyUsage: 0,
          lastUsageReset: new Date(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return res.json({
          canUse: true,
          remainingUses: 3,
          totalUses: 3,
          plan: 'free'
        });
      }
      
      const userData = userDoc.data();
      const currentDate = new Date();
      const lastReset = userData.lastUsageReset?.toDate() || new Date(0);
      
      // 月が変わった場合、使用回数をリセット
      if (currentDate.getMonth() !== lastReset.getMonth() || currentDate.getFullYear() !== lastReset.getFullYear()) {
        await db.collection('users').doc(userId).update({
          monthlyUsage: 0,
          lastUsageReset: currentDate,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return res.json({
          canUse: true,
          remainingUses: userData.plan === 'premium' ? -1 : 3,
          totalUses: userData.plan === 'premium' ? -1 : 3,
          plan: userData.plan
        });
      }
      
      // 使用回数制限チェック
      const maxUses = userData.plan === 'premium' ? -1 : 3;
      const currentUsage = userData.monthlyUsage || 0;
      const canUse = maxUses === -1 || currentUsage < maxUses;
      
      const result = {
        canUse,
        remainingUses: maxUses === -1 ? -1 : Math.max(0, maxUses - currentUsage),
        totalUses: maxUses,
        plan: userData.plan,
        isPremium: userData.plan === 'premium'
      };
      
      res.json(result);
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      // データベースエラーの場合もデフォルト値を返す
      res.json({
        canUse: true,
        remainingUses: 3,
        totalUses: 3,
        plan: 'free'
      });
    }
    
  } catch (error) {
    console.error('❌ Usage limit check error:', error);
    // エラーの場合もデフォルト値を返す（500エラーを避ける）
    res.json({
      canUse: true,
      remainingUses: 3,
      totalUses: 3,
      plan: 'free'
    });
  }
});

// 会話履歴保存API（有料ユーザーのみ）
app.post('/api/conversations', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('💾 会話履歴保存リクエスト for user:', req.user.uid);
    
    // データベースが利用できない場合はエラーを返す
    if (!db) {
      console.warn('⚠️ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    const { title, turns } = req.body;
    
    if (!title || !turns || !Array.isArray(turns)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    try {
      // ユーザー情報を取得してプランをチェック
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userData = userDoc.data();
      
      // 無料ユーザーは会話履歴保存不可
      if (userData.plan !== 'premium') {
        console.log('❌ Free user cannot save conversation history');
        return res.status(403).json({ 
          error: 'Conversation history is only available for premium users',
          message: '会話履歴はプレミアムユーザーのみ利用できます'
        });
      }
      
      // 会話履歴を保存
      const conversationRef = await db.collection('conversations').add({
        userId,
        title,
        turns: turns.map(turn => ({
          ...turn,
          timestamp: new Date(turn.timestamp)
        })),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const result = {
        id: conversationRef.id,
        title,
        turns: turns.length,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('✅ 会話履歴保存成功:', result);
      res.json(result);
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ error: 'Failed to save conversation' });
    }
    
  } catch (error) {
    console.error('❌ 会話履歴保存エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 会話履歴一覧取得API（有料ユーザーのみ）
app.get('/api/conversations', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('📋 会話履歴一覧取得リクエスト for user:', req.user.uid);
    
    // データベースが利用できない場合はエラーを返す
    if (!db) {
      console.warn('⚠️ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    
    try {
      // ユーザー情報を取得してプランをチェック
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userData = userDoc.data();
      
      // 無料ユーザーは会話履歴取得不可
      if (userData.plan !== 'premium') {
        console.log('❌ Free user cannot access conversation history');
        return res.status(403).json({ 
          error: 'Conversation history is only available for premium users',
          message: '会話履歴はプレミアムユーザーのみ利用できます'
        });
      }
      
      // 会話履歴一覧を取得（インデックスエラー回避のためorderByを削除）
      const conversationsSnapshot = await db.collection('conversations')
        .where('userId', '==', userId)
        .get();
      
      const conversations = conversationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          turns: data.turns || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }).sort((a, b) => {
        // updatedAtで降順ソート（新しい順）
        const dateA = a.updatedAt || new Date(0);
        const dateB = b.updatedAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      const result = { conversations };
      console.log('✅ 会話履歴一覧取得成功:', conversations.length, '件');
      res.json(result);
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
    
  } catch (error) {
    console.error('❌ 会話履歴一覧取得エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 特定の会話履歴取得API（有料ユーザーのみ）
app.get('/api/conversations/:id', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('📖 会話履歴取得リクエスト for user:', req.user.uid, 'conversation:', req.params.id);
    
    // データベースが利用できない場合はエラーを返す
    if (!db) {
      console.warn('⚠️ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    const conversationId = req.params.id;
    
    try {
      // ユーザー情報を取得してプランをチェック
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userData = userDoc.data();
      
      // 無料ユーザーは会話履歴取得不可
      if (userData.plan !== 'premium') {
        console.log('❌ Free user cannot access conversation history');
        return res.status(403).json({ 
          error: 'Conversation history is only available for premium users',
          message: '会話履歴はプレミアムユーザーのみ利用できます'
        });
      }
      
      // 会話履歴を取得
      const conversationDoc = await db.collection('conversations').doc(conversationId).get();
      
      if (!conversationDoc.exists) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      const data = conversationDoc.data();
      
      // 他のユーザーの会話履歴は取得不可
      if (data.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const result = {
        id: conversationDoc.id,
        title: data.title,
        turns: data.turns || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
      
      console.log('✅ 会話履歴取得成功:', result.title);
      res.json(result);
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ error: 'Failed to get conversation' });
    }
    
  } catch (error) {
    console.error('❌ 会話履歴取得エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// アカウント削除API
app.delete('/api/delete-account', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('🗑️ アカウント削除リクエスト for user:', req.user.uid);
    
    // データベースが利用できない場合はエラーを返す
    if (!db) {
      console.warn('⚠️ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    
    try {
      // ユーザー情報を取得
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // ユーザーの会話履歴を削除
      const conversationsSnapshot = await db.collection('conversations')
        .where('userId', '==', userId)
        .get();
      
      const deletePromises = conversationsSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      
      console.log('🗑️ 会話履歴削除完了:', conversationsSnapshot.docs.length, '件');
      
      // ユーザー情報を削除
      await db.collection('users').doc(userId).delete();
      
      console.log('✅ アカウント削除成功');
      res.json({ success: true, message: 'アカウントが正常に削除されました' });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ error: 'Failed to delete account' });
    }
    
  } catch (error) {
    console.error('❌ アカウント削除エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 会話履歴削除API（有料ユーザーのみ）
app.delete('/api/conversations/:id', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('🗑️ 会話履歴削除リクエスト for user:', req.user.uid, 'conversation:', req.params.id);
    
    // データベースが利用できない場合はエラーを返す
    if (!db) {
      console.warn('⚠️ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    const conversationId = req.params.id;
    
    try {
      // ユーザー情報を取得してプランをチェック
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userData = userDoc.data();
      
      // 無料ユーザーは会話履歴削除不可
      if (userData.plan !== 'premium') {
        console.log('❌ Free user cannot delete conversation history');
        return res.status(403).json({ 
          error: 'Conversation history is only available for premium users',
          message: '会話履歴はプレミアムユーザーのみ利用できます'
        });
      }
      
      // 会話履歴を取得して権限チェック
      const conversationDoc = await db.collection('conversations').doc(conversationId).get();
      
      if (!conversationDoc.exists) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      const data = conversationDoc.data();
      
      // 他のユーザーの会話履歴は削除不可
      if (data.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // 会話履歴を削除
      await db.collection('conversations').doc(conversationId).delete();
      
      console.log('✅ 会話履歴削除成功');
      res.json({ success: true });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
    
  } catch (error) {
    console.error('❌ 会話履歴削除エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 使用回数増加API
app.post('/api/increment-usage', authenticateUser, requireAuth, async (req, res) => {
  try {
    // データベースが利用できない場合はエラーを返す
    if (!db) {
      console.error('❌ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    
    try {
      // ユーザー情報を取得
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        // ユーザーが存在しない場合は新規作成
        const newUserData = {
          uid: userId,
          email: req.user.email,
          name: req.user.name,
          plan: 'free',
          monthlyUsage: 1, // 初回使用
          lastUsageReset: new Date(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(userId).set(newUserData);
        
        const result = { 
          success: true, 
          remainingUses: 2,
          totalUses: 3
        };
        return res.json(result);
      }
      
      const userData = userDoc.data();
      
      // プレミアムユーザーは制限なし
      if (userData.plan === 'premium') {
        return res.json({ success: true, remainingUses: -1 });
      }
      
      // 無料ユーザーの使用回数制限チェック
      const currentUsage = userData.monthlyUsage || 0;
      
      if (currentUsage >= 3) {
        return res.status(403).json({ 
          error: 'Monthly usage limit exceeded',
          message: '今月の使用回数上限に達しました。プレミアムプランにアップグレードしてください。'
        });
      }
      
      // 使用回数を増加
      const newUsage = currentUsage + 1;
      
      await db.collection('users').doc(userId).update({
        monthlyUsage: newUsage,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const result = { 
        success: true, 
        remainingUses: 2 - currentUsage,
        totalUses: 3
      };
      
      res.json(result);
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ 
        error: 'Failed to increment usage',
        details: dbError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Increment usage error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// メール通知購読管理API
app.post('/api/email-subscription', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('📧 メール通知購読リクエスト for user:', req.user.uid);
    
    if (!db) {
      console.error('❌ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    const { email, enabled } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }
    
    try {
      // ユーザーのメール通知設定を保存
      await db.collection('users').doc(userId).update({
        emailNotifications: {
          enabled: enabled || true,
          email: email,
          subscribedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ メール通知設定を保存しました');
      res.json({ success: true, message: 'メール通知を有効化しました' });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ 
        error: 'Failed to save email subscription',
        details: dbError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Email subscription error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.delete('/api/email-subscription', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('📧 メール通知購読削除リクエスト for user:', req.user.uid);
    
    if (!db) {
      console.error('❌ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    
    try {
      // ユーザーのメール通知設定を削除
      await db.collection('users').doc(userId).update({
        emailNotifications: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ メール通知設定を削除しました');
      res.json({ success: true, message: 'メール通知を無効化しました' });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ 
        error: 'Failed to delete email subscription',
        details: dbError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Email subscription deletion error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.get('/api/email-subscription/:userId', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('📧 メール通知状態確認リクエスト for user:', req.user.uid);
    
    if (!db) {
      console.error('❌ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    
    try {
      // ユーザーのメール通知設定を取得
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const emailNotifications = userData.emailNotifications;
        
        res.json({ 
          enabled: emailNotifications?.enabled || false,
          email: emailNotifications?.email || null
        });
      } else {
        res.json({ enabled: false, email: null });
      }
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ 
        error: 'Failed to get email subscription',
        details: dbError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Email subscription status error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// プッシュ通知購読管理API
app.post('/api/push-subscription', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('🔔 プッシュ通知購読リクエスト for user:', req.user.uid);
    
    if (!db) {
      console.error('❌ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    const { subscription } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ error: 'Subscription data required' });
    }
    
    try {
      // ユーザーのプッシュ通知購読情報を保存
      await db.collection('users').doc(userId).update({
        pushSubscription: subscription,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ プッシュ通知購読情報を保存しました');
      res.json({ success: true, message: 'プッシュ通知購読を登録しました' });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ 
        error: 'Failed to save push subscription',
        details: dbError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Push subscription error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.delete('/api/push-subscription', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('🔔 プッシュ通知購読削除リクエスト for user:', req.user.uid);
    
    if (!db) {
      console.error('❌ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    
    try {
      // ユーザーのプッシュ通知購読情報を削除
      await db.collection('users').doc(userId).update({
        pushSubscription: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ プッシュ通知購読情報を削除しました');
      res.json({ success: true, message: 'プッシュ通知購読を削除しました' });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ 
        error: 'Failed to delete push subscription',
        details: dbError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Push subscription deletion error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// 会話履歴削除API
app.delete('/api/delete-conversations', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('🗑️ 会話履歴削除リクエスト for user:', req.user.uid);
    
    if (!db) {
      console.error('❌ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    
    try {
      // ユーザーの会話履歴を削除
      console.log('🗑️ 会話履歴を削除中...');
      const conversationsRef = db.collection('conversations');
      const conversationsQuery = await conversationsRef.where('userId', '==', userId).get();
      
      const deletePromises = conversationsQuery.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      
      console.log('🗑️ 会話履歴削除完了:', conversationsQuery.docs.length, '件');
      
      res.json({ 
        success: true, 
        message: '会話履歴が正常に削除されました',
        deletedCount: conversationsQuery.docs.length
      });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ 
        error: 'Failed to delete conversations',
        details: dbError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Conversation deletion error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// テンプレート購入処理API
app.post('/api/purchase-template', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('🛒 テンプレート購入リクエスト for user:', req.user.uid);
    
    if (!db) {
      console.error('❌ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    const { templateId } = req.body;
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID required' });
    }
    
    // 有効なテンプレートIDかチェック
    const validTemplateIds = [
      'first_message_pack',
      'line_transition_pack', 
      'date_invitation_pack',
      'conversation_topics_pack'
    ];
    
    if (!validTemplateIds.includes(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    try {
      // ユーザー情報を取得
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userData = userDoc.data();
      const purchasedTemplates = userData.purchasedTemplates || [];
      
      // 既に購入済みかチェック
      if (purchasedTemplates.includes(templateId)) {
        return res.status(400).json({ 
          error: 'Template already purchased',
          message: 'このテンプレートは既に購入済みです'
        });
      }
      
      // 購入済みテンプレートリストに追加
      const updatedPurchasedTemplates = [...purchasedTemplates, templateId];
      
      await db.collection('users').doc(userId).update({
        purchasedTemplates: updatedPurchasedTemplates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ テンプレート購入成功:', templateId);
      res.json({ 
        success: true, 
        message: 'テンプレートの購入が完了しました',
        purchasedTemplates: updatedPurchasedTemplates
      });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ 
        error: 'Failed to purchase template',
        details: dbError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Template purchase error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// テンプレート購入状況確認API
app.get('/api/template-purchase-status', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('📋 テンプレート購入状況確認 for user:', req.user.uid);
    
    if (!db) {
      console.error('❌ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    
    try {
      // ユーザー情報を取得
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userData = userDoc.data();
      const purchasedTemplates = userData.purchasedTemplates || [];
      const isPremiumUser = userData.plan === 'premium';
      
      // プレミアムユーザーは全テンプレート利用可能
      const availableTemplates = isPremiumUser 
        ? ['first_message_pack', 'line_transition_pack', 'date_invitation_pack', 'conversation_topics_pack']
        : purchasedTemplates;
      
      res.json({
        purchasedTemplates: availableTemplates,
        isPremiumUser,
        plan: userData.plan
      });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ 
        error: 'Failed to get template purchase status',
        details: dbError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Template purchase status error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// 購入履歴の取得
app.get('/api/purchase-history', authenticateUser, requireAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // サブスクリプション履歴（インデックスエラー回避のためwhereも削除）
    const subscriptions = await db.collection('subscriptions').get();
    const userSubscriptions = subscriptions.docs.filter(doc => doc.data().userId === userId);

    // テンプレート購入履歴（インデックスエラー回避のためwhereも削除）
    const purchases = await db.collection('purchases').get();
    const userPurchases = purchases.docs.filter(doc => doc.data().userId === userId);

    const subscriptionHistory = userSubscriptions.map(doc => ({
      id: doc.id,
      type: 'subscription',
      plan: doc.data().plan,
      status: doc.data().status,
      amount: 1980,
      createdAt: doc.data().createdAt?.toDate(),
      ...doc.data()
    })).sort((a, b) => {
      // createdAtで降順ソート（新しい順）
      const dateA = a.createdAt || new Date(0);
      const dateB = b.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    const purchaseHistory = userPurchases.map(doc => ({
      id: doc.id,
      type: 'template',
      templateId: doc.data().templateId,
      templateName: doc.data().templateName,
      amount: doc.data().amount,
      purchasedAt: doc.data().purchasedAt?.toDate(),
      ...doc.data()
    })).sort((a, b) => {
      // purchasedAtで降順ソート（新しい順）
      const dateA = a.purchasedAt || new Date(0);
      const dateB = b.purchasedAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    res.json({
      subscriptions: subscriptionHistory,
      purchases: purchaseHistory
    });

  } catch (error) {
    console.error('Purchase history fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// アカウント削除
app.delete('/api/delete-account', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('🗑️ アカウント削除リクエスト for user:', req.user.uid);
    console.log('🗑️ User data:', { uid: req.user.uid, email: req.user.email });
    
    // データベースが利用できない場合はエラーを返す
    if (!db) {
      console.error('❌ Database not available');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.user.uid;
    console.log('🗑️ Processing for userId:', userId);
    
    try {
      // ユーザー情報を取得
      console.log('🗑️ Fetching user document...');
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        console.log('❌ User not found in database');
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userData = userDoc.data();
      console.log('🗑️ User data found:', userData);
      
      // ユーザーの会話履歴を削除（インデックスエラー回避のためwhereを削除）
      console.log('🗑️ Fetching conversations...');
      const conversationsSnapshot = await db.collection('conversations').get();
      const userConversations = conversationsSnapshot.docs.filter(doc => doc.data().userId === userId);
      
      console.log('🗑️ Found conversations:', userConversations.length, '件');
      
      if (userConversations.length > 0) {
        const deletePromises = userConversations.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        console.log('🗑️ 会話履歴削除完了:', userConversations.length, '件');
      } else {
        console.log('🗑️ No conversations to delete');
      }
      
      // ユーザー情報を削除
      console.log('🗑️ Deleting user document...');
      await db.collection('users').doc(userId).delete();
      
      console.log('✅ アカウント削除成功');
      res.json({ success: true, message: 'アカウントが正常に削除されました' });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      console.error('❌ Error details:', {
        message: dbError.message,
        stack: dbError.stack,
        code: dbError.code
      });
      res.status(500).json({ 
        error: 'Failed to delete account',
        details: dbError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ アカウント削除エラー:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// ユーザーデータ削除のヘルパー関数（実装例）
async function deleteUserData(userId) {
  try {
    if (!db) {
      console.error('❌ Firestore未初期化 - ユーザーデータ削除をスキップ');
      return;
    }

    // 会話履歴削除（インデックスエラー回避のためwhereを削除）
    const conversationsQuery = await db.collection('conversations').get();
    const userConversations = conversationsQuery.docs.filter(doc => doc.data().userId === userId);
    const deleteConversationPromises = userConversations.map(doc => doc.ref.delete());
    await Promise.all(deleteConversationPromises);
    console.log('✅ 会話履歴削除完了:', userConversations.length, '件');
    
    // 購入履歴削除（インデックスエラー回避のためwhereを削除）
    const purchasesQuery = await db.collection('purchases').get();
    const userPurchases = purchasesQuery.docs.filter(doc => doc.data().userId === userId);
    const deletePurchasePromises = userPurchases.map(doc => doc.ref.delete());
    await Promise.all(deletePurchasePromises);
    console.log('✅ 購入履歴削除完了:', userPurchases.length, '件');
    
    // ユーザープロフィール削除
    await db.collection('users').doc(userId).delete();
    console.log('✅ ユーザープロフィール削除完了:', userId);
    
  } catch (error) {
    console.error('❌ Firestore削除エラー:', error);
    throw error;
  }
}

// Stripe Webhook処理
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  console.log('🔔 Webhook受信:', {
    signature: sig ? '✅ あり' : '❌ なし',
    secret: endpointSecret ? '✅ 設定済み' : '❌ 未設定',
    bodyLength: req.body.length
  });

  let event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // 開発環境でWebhook Secretが未設定の場合
      console.log('⚠️  Webhook Secret未設定 - イベントを直接パース');
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📨 Webhookイベント:', event.type);

  // イベント処理
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ 決済完了:', session.id);
      
      // データベースに購入情報を保存
      await savePurchaseToDatabase(session);
      
      // テンプレート購入の場合はユーザーの購入済みテンプレートリストを更新
      if (session.mode === 'payment') {
        await handleTemplatePurchase(session);
      }
      break;

    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('✅ サブスクリプション開始:', subscription.id);
      
      await handleSubscriptionStart(subscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('⚠️  サブスクリプション終了:', deletedSubscription.id);
      
      await handleSubscriptionEnd(deletedSubscription);
      break;

    default:
      console.log(`📋 未処理イベント: ${event.type}`);
  }

  res.json({ received: true });
});

// データベース操作関数
async function savePurchaseToDatabase(session) {
  try {
    if (!db) {
      console.error('❌ Firestore未初期化 - 購入データを保存できません');
      return;
    }

    const purchaseData = {
      stripeSessionId: session.id,
      customerEmail: session.customer_details?.email,
      amount: session.amount_total,
      currency: session.currency,
      status: 'completed',
      type: session.mode === 'subscription' ? 'subscription' : 'template',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('purchases').add(purchaseData);
    console.log('✅ 購入データをFirestoreに保存:', session.id);
  } catch (error) {
    console.error('❌ 購入データ保存エラー:', error);
  }
}

async function handleSubscriptionStart(subscription) {
  try {
    if (!db) {
      console.error('❌ Firestore未初期化 - サブスクリプション開始処理をスキップ');
      return;
    }

    // カスタマー情報からユーザーを特定してプラン更新
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    // customer.emailからユーザーを特定してプラン更新
    const usersQuery = await db.collection('users').where('email', '==', customer.email).get();
    
    if (!usersQuery.empty) {
      const userDoc = usersQuery.docs[0];
      await userDoc.ref.update({
        plan: 'premium',
        subscriptionId: subscription.id,
        subscriptionStatus: 'active',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ ユーザープランをプレミアムに更新:', customer.email);
    } else {
      console.error('❌ ユーザーが見つかりません:', customer.email);
    }
  } catch (error) {
    console.error('❌ サブスクリプション開始処理エラー:', error);
  }
}

async function handleSubscriptionEnd(subscription) {
  try {
    if (!db) {
      console.error('❌ Firestore未初期化 - サブスクリプション終了処理をスキップ');
      return;
    }

    const customer = await stripe.customers.retrieve(subscription.customer);
    
    // customer.emailからユーザーを特定してプラン更新
    const usersQuery = await db.collection('users').where('email', '==', customer.email).get();
    
    if (!usersQuery.empty) {
      const userDoc = usersQuery.docs[0];
      const userData = userDoc.data();
      
      await userDoc.ref.update({
        plan: 'free',
        subscriptionId: admin.firestore.FieldValue.delete(),
        subscriptionStatus: 'canceled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ ユーザープランを無料に戻しました:', customer.email);
      
      // サブスクリプション解約通知メール
      const emailTemplate = generateEmailTemplate('subscription_canceled', {
        name: userData.name || customer.email,
        periodEnd: new Date(subscription.current_period_end * 1000).toLocaleDateString('ja-JP')
      });
      
      if (emailTemplate) {
        await sendEmail(customer.email, emailTemplate.subject, emailTemplate.html, emailTemplate.text);
      }
    } else {
      console.error('❌ ユーザーが見つかりません:', customer.email);
    }
  } catch (error) {
    console.error('❌ サブスクリプション終了処理エラー:', error);
  }
}

// テンプレート購入処理
async function handleTemplatePurchase(session) {
  try {
    if (!db) {
      console.error('❌ Firestore未初期化 - テンプレート購入処理をスキップ');
      return;
    }

    const customerEmail = session.customer_details?.email;
    if (!customerEmail) {
      console.error('❌ カスタマー情報が見つかりません');
      return;
    }

    // セッションの商品情報からテンプレートIDを特定
    const lineItems = session.line_items?.data || [];
    let templateId = null;

    for (const item of lineItems) {
      const productName = item.price_data?.product_data?.name;
      if (productName) {
        // 商品名からテンプレートIDを特定
        if (productName.includes('初回メッセ')) {
          templateId = 'first_message_pack';
        } else if (productName.includes('LINE移行')) {
          templateId = 'line_transition_pack';
        } else if (productName.includes('誘い文句')) {
          templateId = 'date_invitation_pack';
        } else if (productName.includes('会話ネタ')) {
          templateId = 'conversation_topics_pack';
        }
        break;
      }
    }

    if (!templateId) {
      console.error('❌ テンプレートIDを特定できませんでした');
      return;
    }

    // ユーザーを特定してテンプレート購入情報を更新
    const usersQuery = await db.collection('users').where('email', '==', customerEmail).get();
    
    if (!usersQuery.empty) {
      const userDoc = usersQuery.docs[0];
      const userData = userDoc.data();
      const purchasedTemplates = userData.purchasedTemplates || [];
      
      // 既に購入済みでない場合のみ追加
      if (!purchasedTemplates.includes(templateId)) {
        const updatedPurchasedTemplates = [...purchasedTemplates, templateId];
        
        await userDoc.ref.update({
          purchasedTemplates: updatedPurchasedTemplates,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // 購入履歴も記録
        await db.collection('purchases').add({
          userId: userDoc.id,
          type: 'template',
          templateId: templateId,
          templateName: getTemplateDisplayName(templateId),
          amount: getTemplatePrice(templateId),
          purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'completed'
        });
        
        console.log('✅ テンプレート購入完了:', templateId, 'for user:', customerEmail);
        
        // 購入完了通知メール
        const emailTemplate = generateEmailTemplate('template_purchased', {
          name: userData.name || customerEmail,
          templateName: getTemplateDisplayName(templateId)
        });
        
        if (emailTemplate) {
          await sendEmail(customerEmail, emailTemplate.subject, emailTemplate.html, emailTemplate.text);
        }
      } else {
        console.log('ℹ️ テンプレートは既に購入済み:', templateId);
      }
    } else {
      console.error('❌ ユーザーが見つかりません:', customerEmail);
    }
  } catch (error) {
    console.error('❌ テンプレート購入処理エラー:', error);
  }
}

// テンプレート表示名を取得
function getTemplateDisplayName(templateId) {
  const templateNames = {
    'first_message_pack': '初回メッセージパック',
    'line_transition_pack': 'LINE移行パック',
    'date_invitation_pack': 'デート誘いパック',
    'conversation_topics_pack': '会話ネタパック'
  };
  return templateNames[templateId] || templateId;
}

// テンプレート価格を取得
function getTemplatePrice(templateId) {
  const templatePrices = {
    'first_message_pack': 2500,
    'line_transition_pack': 2500,
    'date_invitation_pack': 2500,
    'conversation_topics_pack': 2500
  };
  return templatePrices[templateId] || 0;
}



// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ルートパスの処理
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found. Please run npm run build first.');
  }
});

// SPAのルーティング - 静的ファイル以外のGETリクエストをindex.htmlにリダイレクト
app.use((req, res, next) => {
  // APIルートは除外
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // GETリクエストのみ処理
  if (req.method !== 'GET') {
    return next();
  }
  
  // index.htmlを返す（SPAルーティング）
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found. Please run npm run build first.');
  }
});

// 404エラーハンドラー - すべてのリクエストを処理
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).send('Not Found');
  }
});

// グローバルエラーハンドラー
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Frontend served from: ${path.join(__dirname, '../dist')}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Firebase Admin initialized: ${admin.apps.length > 0}`);
  console.log(`🗄️ Firestore initialized: ${!!db}`);
});