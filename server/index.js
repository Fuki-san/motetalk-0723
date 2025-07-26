import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';
import {
  getTemplateDisplayName,
  getTemplatePrice,
  getTemplateIdFromPriceId,
  removeDuplicatePurchases,
  sortPurchasesByDate,
  normalizeAmount,
  formatDateToISO,
  formatDateToJapanese
} from './utils/purchaseUtils.js';

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
  VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN ? '✅ 設定済み' : '❌ 未設定',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001
});

// Sentry環境変数の詳細確認
if (process.env.VITE_SENTRY_DSN) {
  console.log('🔍 Sentry DSN設定確認:', {
    hasValue: !!process.env.VITE_SENTRY_DSN,
    length: process.env.VITE_SENTRY_DSN.length,
    startsWithHttps: process.env.VITE_SENTRY_DSN.startsWith('https://'),
    containsIngest: process.env.VITE_SENTRY_DSN.includes('ingest')
  });
} else {
  console.warn('⚠️ VITE_SENTRY_DSNが設定されていません');
}

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
    // undefined値を無視する設定を有効化
    db.settings({ ignoreUndefinedProperties: true });
    
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

// 静的ファイルの配信設定（JS、CSS、SVGファイルのみ）
const staticPath = path.join(__dirname, '../dist');

// JSファイルの配信
app.use((req, res, next) => {
  if (req.path.match(/\.js$/)) {
    console.log(`📁 Serving JS file: ${req.path}`);
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // 認証状態を保持するため、Clear-Site-Dataを削除
    return express.static(staticPath)(req, res, next);
  }
  next();
});

// CSSファイルの配信
app.use((req, res, next) => {
  if (req.path.match(/\.css$/)) {
    console.log(`📁 Serving CSS file: ${req.path}`);
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // 認証状態を保持するため、Clear-Site-Dataを削除
    return express.static(staticPath)(req, res, next);
  }
  next();
});

// SVGファイルの配信
app.use((req, res, next) => {
  if (req.path.match(/\.svg$/)) {
    console.log(`📁 Serving SVG file: ${req.path}`);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // 認証状態を保持するため、Clear-Site-Dataを削除
    return express.static(staticPath)(req, res, next);
  }
  next();
});

// デバッグ用ログ
console.log('📁 静的ファイルパス:', staticPath);
console.log('🔍 静的ファイル存在確認:', fs.existsSync(path.join(staticPath, 'index.html')));
if (fs.existsSync(staticPath)) {
  console.log('📁 静的ファイル一覧:', fs.readdirSync(staticPath));
} else {
  console.log('❌ 静的ファイルディレクトリが存在しません:', staticPath);
}

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



// 静的ファイルが見つからない場合の404ハンドラー
app.use((req, res, next) => {
  // 静的ファイルの拡張子をチェック
  const staticExtensions = ['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  const hasStaticExtension = staticExtensions.some(ext => req.path.endsWith(ext));
  
  if (hasStaticExtension) {
    // 静的ファイルが見つからない場合の詳細ログ
    console.log(`❌ Static file not found: ${req.path}`);
    console.log(`📁 Available files in dist:`, fs.readdirSync(path.join(__dirname, '../dist')));
    
    // より詳細なエラー情報を返す
    return res.status(404).json({ 
      error: 'Static file not found',
      path: req.path,
      availableFiles: fs.readdirSync(path.join(__dirname, '../dist')),
      timestamp: new Date().toISOString()
    });
  }
  
  next();
});

// Stripe Checkout Session作成
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('🛒 Checkout session作成リクエスト:', req.body);
    
    const { type, planId, templateId, priceId, successUrl, cancelUrl } = req.body;

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
      // 買い切り購入設定 - priceIdが指定されている場合はそれを使用、そうでなければ従来の方法
      let priceIdToUse;
      
      if (priceId) {
        // フロントエンドから送信されたpriceIdを使用
        priceIdToUse = priceId;
        console.log('🔍 フロントエンドから送信されたpriceIdを使用:', priceIdToUse);
      } else {
        // 従来の方法（templateIdからpriceIdを取得）
        const priceIds = {
          first_message_pack: 'price_1Rl6WZQoDVsMq3SibYnakW14',
          line_transition_pack: 'price_1Rl6WZQoDVsMq3SibYnakW14',
          date_invitation_pack: 'price_1Roiu5QoDVsMq3SiYXbdh2xT',
          conversation_topics_pack: 'price_1RoiuyQoDVsMq3Si9MQuzT6x'
        };
        priceIdToUse = priceIds[templateId];
        console.log('🔍 templateIdからpriceIdを取得:', templateId, '->', priceIdToUse);
      }

      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [{
        price: priceIdToUse,
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

// ユーザープロフィール取得API
app.get('/api/user-profile', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('👤 ユーザープロフィール取得リクエスト for user:', req.user.uid);
    
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
        // ユーザーが存在しない場合は新規作成
        const defaultProfile = {
          uid: userId,
          email: req.user.email || '',
          name: req.user.name || 'ユーザー',
          photoURL: req.user.picture,
          plan: 'free',
          subscriptionStatus: undefined,
          purchasedTemplates: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.collection('users').doc(userId).set(defaultProfile);
        
        console.log('✅ 新規ユーザープロフィール作成:', userId);
        res.json(defaultProfile);
        return;
      }
      
      const userData = userDoc.data();
      
      // 購入履歴から最新のサブスクリプション状態を確認（インデックスエラー回避のため簡素化）
      const allPurchases = await db.collection('purchases')
        .where('userId', '==', userId)
        .get();
      
      let currentPlan = userData.plan || 'free';
      let subscriptionStatus = userData.subscriptionStatus;
      
      // メモリ上でフィルタリングとソート
      const subscriptions = allPurchases.docs
        .filter(doc => doc.data().type === 'subscription')
        .sort((a, b) => b.data().createdAt?.toDate() - a.data().createdAt?.toDate());
      
      if (subscriptions.length > 0) {
        const latestSubscription = subscriptions[0].data();
        if (latestSubscription.status === 'completed') {
          currentPlan = 'premium';
          subscriptionStatus = 'active';
        }
      }
      
      // 購入済みテンプレートを取得（メモリ上でフィルタリング）
      const templatePurchases = allPurchases.docs
        .filter(doc => doc.data().type === 'template');
      
      const purchasedTemplates = templatePurchases.map(doc => doc.data().templateId);
      
      const profile = {
        uid: userId,
        email: userData.email || req.user.email || '',
        name: userData.name || req.user.name || 'ユーザー',
        photoURL: userData.photoURL || req.user.picture || null, // nullを明示的に設定
        plan: currentPlan,
        subscriptionId: userData.subscriptionId,
        subscriptionStatus: subscriptionStatus,
        purchasedTemplates: purchasedTemplates
      };
      
      console.log('✅ ユーザープロフィール取得成功:', {
        uid: userId,
        plan: currentPlan,
        purchasedTemplates: purchasedTemplates.length
      });
      
      res.json(profile);
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ error: 'Failed to get user profile' });
    }
    
  } catch (error) {
    console.error('❌ ユーザープロフィール取得エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 購入履歴取得API
app.get('/api/purchase-history', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('📋 購入履歴取得リクエスト for user:', req.user.uid);
    
          // データベースが利用できない場合はエラーを返す
      if (!db) {
        console.warn('⚠️ Database not available');
        return res.status(503).json({ error: 'Database not available' });
      }
      
      const userId = req.user.uid;
      
      try {
        // purchasesコレクションのみから取得（重複を避けるため）
        const allPurchasesSnapshot = await db.collection('purchases')
          .where('userId', '==', userId)
          .get();
        
        const allPurchases = allPurchasesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('🔍 データベースから取得した全購入データ:', allPurchases.map(p => ({
          id: p.id,
          type: p.type,
          templateId: p.templateId,
          templateName: p.templateName,
          stripeSessionId: p.stripeSessionId,
          createdAt: p.createdAt?.toDate?.() || p.createdAt,
          purchasedAt: p.purchasedAt?.toDate?.() || p.purchasedAt
        })));
        
        // サブスクリプション購入履歴（重複除去）
        const subscriptions = removeDuplicatePurchases(
          allPurchases.filter(purchase => purchase.type === 'subscription')
        ).map(purchase => ({
          id: purchase.id,
          amount: normalizeAmount(purchase.amount || 1980),
          createdAt: purchase.createdAt?.toDate() || new Date(),
          status: purchase.status || 'completed'
        }));
        
        // テンプレート購入履歴（重複除去）
        const templatePurchases = allPurchases.filter(purchase => purchase.type === 'template');
        console.log('🔍 元のテンプレート購入数:', templatePurchases.length);
        
        const uniquePurchases = removeDuplicatePurchases(templatePurchases);
        console.log('🔍 重複除去後のテンプレート購入数:', uniquePurchases.length);
        console.log('🔍 重複除去後の詳細:', uniquePurchases.map(p => ({
          id: p.id,
          templateId: p.templateId,
          templateName: p.templateName,
          stripeSessionId: p.stripeSessionId
        })));
        
        const purchases = uniquePurchases.map(purchase => {
          const templateName = purchase.templateName || getTemplateDisplayName(purchase.templateId);
          const amount = normalizeAmount(purchase.amount || getTemplatePrice(purchase.templateId));
          const purchasedAt = purchase.purchasedAt?.toDate() || purchase.createdAt?.toDate() || new Date();
          
          console.log('🔍 購入データ詳細:', {
            id: purchase.id,
            templateId: purchase.templateId,
            templateName,
            amount,
            purchasedAt: purchasedAt.toISOString(),
            stripeSessionId: purchase.stripeSessionId
          });
          
          return {
            id: purchase.id,
            templateId: purchase.templateId,
            templateName,
            amount,
            purchasedAt: formatDateToJapanese(purchasedAt),
            status: purchase.status || 'completed'
          };
        });
        
        // 日付でソート（メモリ上で実行）
        subscriptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        purchases.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
        
        const result = {
          subscriptions,
          purchases
        };
        
        console.log('✅ 購入履歴取得成功:', {
          subscriptions: subscriptions.length,
          purchases: purchases.length
        });
        
        res.json(result);
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      res.status(500).json({ error: 'Failed to get purchase history' });
    }
    
  } catch (error) {
    console.error('❌ 購入履歴取得エラー:', error);
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
      
      // usersコレクションを更新
      await db.collection('users').doc(userId).update({
        purchasedTemplates: updatedPurchasedTemplates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // template_purchasesコレクションにも記録を追加
      await db.collection('template_purchases').add({
        userId: userId,
        templateId: templateId,
        templateName: getTemplateDisplayName(templateId),
        amount: getTemplatePrice(templateId),
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
        type: 'template',
        status: 'completed'
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
      
      // purchasedTemplatesが配列の場合はそのまま使用、数値の場合はtemplate_purchasesコレクションから取得
      let purchasedTemplates = [];
      if (Array.isArray(userData.purchasedTemplates)) {
        // 配列の場合はそのまま使用
        purchasedTemplates = userData.purchasedTemplates;
        console.log('🔍 usersコレクションから購入済みテンプレート取得:', purchasedTemplates);
      } else if (userData.purchasedTemplates && userData.purchasedTemplates > 0) {
        // 数値の場合は、template_purchasesコレクションから実際のテンプレートIDを取得
        const templatePurchasesSnapshot = await db.collection('template_purchases')
          .where('userId', '==', userId)
          .get();
        
        console.log('🔍 template_purchases検索結果:', {
          userId,
          userDataPurchasedTemplates: userData.purchasedTemplates,
          templatePurchasesCount: templatePurchasesSnapshot.docs.length,
          templatePurchasesData: templatePurchasesSnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }))
        });
        
        purchasedTemplates = templatePurchasesSnapshot.docs.map(doc => doc.data().templateId);
      }
      
      // purchasesコレクションも確認
      const purchasesSnapshot = await db.collection('purchases')
        .where('userId', '==', userId)
        .where('type', '==', 'template')
        .get();
      
      console.log('🔍 purchases検索結果:', {
        userId,
        purchasesCount: purchasesSnapshot.docs.length,
        purchasesData: purchasesSnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      });
      
      // purchasesコレクションからtemplateIdを取得（推測は行わない）
      const purchasesTemplates = purchasesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔍 purchasesドキュメント詳細:', {
          id: doc.id,
          templateId: data.templateId,
          type: data.type,
          amount: data.amount,
          templateName: data.templateName
        });
        // templateIdが存在すればそのまま、なければnull（推測しない）
        return data.templateId || null;
      });
      
      // 重複を除去してユニークなテンプレートIDのみを取得（null値を除外）
      const uniquePurchasesTemplates = [...new Set(purchasesTemplates)].filter(id => id !== null);
      console.log('🔍 purchasesから取得したテンプレートID:', uniquePurchasesTemplates);
      
      // 両方のソースからテンプレートIDをマージ（null値を除外）
      const allPurchasedTemplates = [...purchasedTemplates, ...uniquePurchasesTemplates];
      const uniquePurchasedTemplates = [...new Set(allPurchasedTemplates)].filter(id => id !== null);
      
      console.log('🔍 最終的な購入済みテンプレート:', uniquePurchasedTemplates);
      
            const isPremiumUser = userData.plan === 'premium';
   
      // サブスク会員も無料会員も実際に購入したテンプレートのみ利用可能
      const availableTemplates = uniquePurchasedTemplates;
      
      const response = {
        purchasedTemplates: availableTemplates,
        isPremiumUser,
        plan: userData.plan
      };
      
      console.log('✅ テンプレート購入状況取得成功:', {
        userId,
        purchasedTemplates: availableTemplates,
        purchasedTemplatesCount: availableTemplates.length,
        isPremiumUser,
        plan: userData.plan,
        userDataPurchasedTemplates: userData.purchasedTemplates,
        purchasesCount: purchasesSnapshot?.docs?.length || 0
      });
      
      res.json(response);
      
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
      
      // 購入履歴を削除
      console.log('🗑️ Fetching purchases...');
      const purchasesSnapshot = await db.collection('purchases').get();
      console.log('🗑️ Total purchases in database:', purchasesSnapshot.docs.length, '件');
      
      const userPurchases = purchasesSnapshot.docs.filter(doc => {
        const data = doc.data();
        console.log('🗑️ Checking purchase doc:', doc.id, 'userId:', data.userId, 'target userId:', userId);
        return data.userId === userId;
      });
      
      console.log('🗑️ Found purchases for user:', userPurchases.length, '件');
      
      if (userPurchases.length > 0) {
        try {
          const deletePromises = userPurchases.map(doc => doc.ref.delete());
          await Promise.all(deletePromises);
          console.log('🗑️ 購入履歴削除完了:', userPurchases.length, '件');
        } catch (deleteError) {
          console.error('❌ 購入履歴削除エラー:', deleteError);
          throw deleteError;
        }
      } else {
        console.log('🗑️ No purchases to delete for user:', userId);
      }
      
      // テンプレート購入状況を削除
      console.log('🗑️ Fetching template purchases...');
      const templatePurchasesSnapshot = await db.collection('template_purchases').get();
      console.log('🗑️ Total template purchases in database:', templatePurchasesSnapshot.docs.length, '件');
      
      const userTemplatePurchases = templatePurchasesSnapshot.docs.filter(doc => {
        const data = doc.data();
        console.log('🗑️ Checking template purchase doc:', doc.id, 'userId:', data.userId, 'target userId:', userId);
        return data.userId === userId;
      });
      
      console.log('🗑️ Found template purchases for user:', userTemplatePurchases.length, '件');
      
      if (userTemplatePurchases.length > 0) {
        try {
          const deletePromises = userTemplatePurchases.map(doc => doc.ref.delete());
          await Promise.all(deletePromises);
          console.log('🗑️ テンプレート購入状況削除完了:', userTemplatePurchases.length, '件');
        } catch (deleteError) {
          console.error('❌ テンプレート購入状況削除エラー:', deleteError);
          throw deleteError;
        }
      } else {
        console.log('🗑️ No template purchases to delete for user:', userId);
      }
      
      // サブスクリプション履歴を削除
      console.log('🗑️ Fetching subscriptions...');
      const subscriptionsSnapshot = await db.collection('subscriptions').get();
      console.log('🗑️ Total subscriptions in database:', subscriptionsSnapshot.docs.length, '件');
      
      const userSubscriptions = subscriptionsSnapshot.docs.filter(doc => {
        const data = doc.data();
        console.log('🗑️ Checking subscription doc:', doc.id, 'userId:', data.userId, 'target userId:', userId);
        return data.userId === userId;
      });
      
      console.log('🗑️ Found subscriptions for user:', userSubscriptions.length, '件');
      
      if (userSubscriptions.length > 0) {
        try {
          const deletePromises = userSubscriptions.map(doc => doc.ref.delete());
          await Promise.all(deletePromises);
          console.log('🗑️ サブスクリプション履歴削除完了:', userSubscriptions.length, '件');
        } catch (deleteError) {
          console.error('❌ サブスクリプション履歴削除エラー:', deleteError);
          throw deleteError;
        }
      } else {
        console.log('🗑️ No subscriptions to delete for user:', userId);
      }
      
      // その他のユーザー関連データを削除
      console.log('🗑️ Checking for other user data...');
      
      // 使用量データを削除
      const usageSnapshot = await db.collection('usage').get();
      const userUsage = usageSnapshot.docs.filter(doc => doc.data().userId === userId);
      if (userUsage.length > 0) {
        try {
          const deletePromises = userUsage.map(doc => doc.ref.delete());
          await Promise.all(deletePromises);
          console.log('🗑️ 使用量データ削除完了:', userUsage.length, '件');
        } catch (deleteError) {
          console.error('❌ 使用量データ削除エラー:', deleteError);
        }
      }
      
      // 通知設定を削除
      const notificationsSnapshot = await db.collection('notifications').get();
      const userNotifications = notificationsSnapshot.docs.filter(doc => doc.data().userId === userId);
      if (userNotifications.length > 0) {
        try {
          const deletePromises = userNotifications.map(doc => doc.ref.delete());
          await Promise.all(deletePromises);
          console.log('🗑️ 通知設定削除完了:', userNotifications.length, '件');
        } catch (deleteError) {
          console.error('❌ 通知設定削除エラー:', deleteError);
        }
      }
      
      // Stripeのサブスクリプションを解約
      if (userData.subscriptionId) {
        try {
          console.log('🗑️ Canceling Stripe subscription:', userData.subscriptionId);
          await stripe.subscriptions.update(userData.subscriptionId, {
            cancel_at_period_end: true
          });
          console.log('✅ Stripe subscription canceled');
        } catch (stripeError) {
          console.error('❌ Stripe subscription cancellation error:', stripeError);
          // StripeエラーでもFirestoreの削除は続行
        }
      }
      
      // ユーザー情報を削除
      console.log('🗑️ Deleting user document...');
      await db.collection('users').doc(userId).delete();
      
      // Firebase Authenticationからユーザーを削除
      try {
        console.log('🗑️ Deleting Firebase Auth user...');
        await admin.auth().deleteUser(userId);
        console.log('✅ Firebase Auth user deleted');
      } catch (authError) {
        console.error('❌ Firebase Auth user deletion error:', authError);
        // AuthエラーでもFirestoreの削除は完了しているので成功とする
      }
      
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
  
  console.log('🔔 Webhook受信開始');
  console.log('📋 リクエスト詳細:', {
    method: req.method,
    url: req.url,
    signature: sig ? '✅ あり' : '❌ なし',
    secret: endpointSecret ? '✅ 設定済み' : '❌ 未設定',
    bodyLength: req.body.length,
    headers: Object.keys(req.headers)
  });

  let event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // 開発環境でWebhook Secretが未設定の場合
      console.log('⚠️  Webhook Secret未設定 - イベントを直接パース');
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    // 開発環境ではエラーを無視して処理を続行
    console.log('⚠️  開発環境のため、エラーを無視して処理を続行');
    try {
      event = JSON.parse(req.body.toString());
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message);
      return res.status(400).send(`Webhook Error: ${parseErr.message}`);
    }
  }

  console.log('📨 Webhookイベント:', event.type);

  // イベント処理
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ 決済完了:', session.id);
      
      // セッションを再取得してline_itemsを含む完全な情報を取得
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items']
      });
      
      console.log('🔍 セッション詳細:', {
        mode: fullSession.mode,
        amount_total: fullSession.amount_total,
        line_items: fullSession.line_items?.data?.length || 0,
        customer_email: fullSession.customer_details?.email
      });
      
      // データベースに購入情報を保存
      await savePurchaseToDatabase(fullSession);
      
      // テンプレート購入の場合はユーザーの購入済みテンプレートリストを更新
      if (fullSession.mode === 'payment') {
        console.log('🔄 テンプレート購入処理を開始');
        // savePurchaseToDatabaseで既に保存済みのため、ユーザー情報の更新のみ実行
        await updateUserPurchasedTemplates(fullSession);
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

    const customerEmail = session.customer_details?.email;
    if (!customerEmail) {
      console.error('❌ カスタマー情報が見つかりません');
      return;
    }

    // ユーザーを特定
    const usersQuery = await db.collection('users').where('email', '==', customerEmail).get();
    let userId = null;
    
    if (!usersQuery.empty) {
      userId = usersQuery.docs[0].id;
    } else {
      console.error('❌ ユーザーが見つかりません:', customerEmail);
      return;
    }

    // セッションからテンプレートIDを取得
    let templateId = null;
    if (session.mode !== 'subscription') {
      const lineItems = session.line_items?.data || [];
      console.log('🔍 line_items:', lineItems.length, '件');
      
      for (const item of lineItems) {
        const priceId = item.price?.id;
        console.log('🔍 priceId:', priceId);
        // 共通ユーティリティを使用してテンプレートIDを特定
        templateId = getTemplateIdFromPriceId(priceId);
        if (templateId) {
          console.log('✅ priceIdからテンプレートを特定:', templateId);
          break;
        } else {
          console.log('❓ 未知のpriceId、templateIdはnullで保存');
        }
      }
    }

    const purchaseData = {
      userId: userId,
      stripeSessionId: session.id,
      customerEmail: customerEmail,
      amount: session.amount_total,
      currency: session.currency,
      status: 'completed',
      type: session.mode === 'subscription' ? 'subscription' : 'template',
      templateId: templateId,
      templateName: templateId ? getTemplateDisplayName(templateId) : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // templateIdが設定されていない場合は何も推測せずnullのまま保存
    console.log('🔍 最終的な購入データ:', {
      templateId: purchaseData.templateId,
      templateName: purchaseData.templateName,
      amount: purchaseData.amount
    });

    await db.collection('purchases').add(purchaseData);
    console.log('✅ 購入データをFirestoreに保存:', session.id, 'for user:', userId);
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

    // セッションの商品情報からテンプレートIDを特定（priceIdベース）
    const lineItems = session.line_items?.data || [];
    let templateId = null;

    for (const item of lineItems) {
      const priceId = item.price?.id;
      console.log('🔍 handleTemplatePurchase - priceId:', priceId);
      // 共通ユーティリティを使用してテンプレートIDを特定
      templateId = getTemplateIdFromPriceId(priceId);
      if (templateId) {
        console.log('✅ priceIdからテンプレートを特定:', templateId);
        break;
      } else {
        console.log('❓ 未知のpriceId、templateIdはnull');
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
        
        // 購入履歴も記録（purchasesコレクション）
        await db.collection('purchases').add({
          userId: userDoc.id,
          type: 'template',
          templateId: templateId,
          templateName: getTemplateDisplayName(templateId),
          amount: getTemplatePrice(templateId),
          purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'completed'
        });
        
        // template_purchasesコレクションにも記録
        await db.collection('template_purchases').add({
          userId: userDoc.id,
          templateId: templateId,
          templateName: getTemplateDisplayName(templateId),
          amount: getTemplatePrice(templateId),
          purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'completed',
          type: 'template'
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

// ユーザーの購入済みテンプレートリストを更新（重複保存を防ぐ）
async function updateUserPurchasedTemplates(session) {
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

    // セッションの商品情報からテンプレートIDを特定（priceIdベース）
    const lineItems = session.line_items?.data || [];
    let templateId = null;

    for (const item of lineItems) {
      const priceId = item.price?.id;
      console.log('🔍 updateUserPurchasedTemplates - priceId:', priceId);
      // 共通ユーティリティを使用してテンプレートIDを特定
      templateId = getTemplateIdFromPriceId(priceId);
      if (templateId) {
        console.log('✅ priceIdからテンプレートを特定:', templateId);
        break;
      } else {
        console.log('❓ 未知のpriceId、templateIdはnull');
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
        
        console.log('✅ ユーザーの購入済みテンプレートリストを更新:', templateId, 'for user:', customerEmail);
        
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

// テンプレート関連の関数は共通ユーティリティに移動済み



// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

  // ルートパスの処理
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    // 強力なキャッシュ制御ヘッダーを設定（認証状態を保持するためClear-Site-Dataは削除）
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // HTMLファイルを読み込んで動的に更新
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // 現在のビルドファイルを検出
    const distFiles = fs.readdirSync(path.join(__dirname, '../dist'));
    const jsFile = distFiles.find(file => file.endsWith('.js') && file.startsWith('index-'));
    const cssFile = distFiles.find(file => file.endsWith('.css') && file.startsWith('index-'));
    
    if (jsFile && cssFile) {
      // キャッシュバスティング用のタイムスタンプを追加
      const timestamp = Date.now();
      
      // HTML内のファイル名を現在のビルドファイルに置換（キャッシュバスティング付き）
      htmlContent = htmlContent.replace(
        /src="\/index-[^"]+\.js"/g,
        `src="/${jsFile}?v=${timestamp}"`
      );
      htmlContent = htmlContent.replace(
        /href="\/index-[^"]+\.css"/g,
        `href="/${cssFile}?v=${timestamp}"`
      );
      
      console.log(`🔄 HTMLファイルを動的更新（キャッシュバスティング付き）: ${jsFile}?v=${timestamp}, ${cssFile}?v=${timestamp}`);
    }
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
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
  
  // 静的ファイルの拡張子を持つリクエストは除外
  const staticExtensions = ['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  const hasStaticExtension = staticExtensions.some(ext => req.path.endsWith(ext));
  
  if (hasStaticExtension) {
    return next();
  }
  
  // GETリクエストのみ処理
  if (req.method !== 'GET') {
    return next();
  }
  
  // index.htmlを返す（SPAルーティング）
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    console.log(`📄 SPAルーティング: ${req.path} -> index.html`);
    // 強力なキャッシュ制御ヘッダーを設定（認証状態を保持するためClear-Site-Dataは削除）
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // HTMLファイルを読み込んで動的に更新
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // 現在のビルドファイルを検出
    const distFiles = fs.readdirSync(path.join(__dirname, '../dist'));
    const jsFile = distFiles.find(file => file.endsWith('.js') && file.startsWith('index-'));
    const cssFile = distFiles.find(file => file.endsWith('.css') && file.startsWith('index-'));
    
    if (jsFile && cssFile) {
      // キャッシュバスティング用のタイムスタンプを追加
      const timestamp = Date.now();
      
      // HTML内のファイル名を現在のビルドファイルに置換（キャッシュバスティング付き）
      htmlContent = htmlContent.replace(
        /src="\/index-[^"]+\.js"/g,
        `src="/${jsFile}?v=${timestamp}"`
      );
      htmlContent = htmlContent.replace(
        /href="\/index-[^"]+\.css"/g,
        `href="/${cssFile}?v=${timestamp}"`
      );
      
      console.log(`🔄 SPAルーティングでHTMLファイルを動的更新（キャッシュバスティング付き）: ${jsFile}?v=${timestamp}, ${cssFile}?v=${timestamp}`);
    }
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
  } else {
    console.log(`❌ index.html not found: ${indexPath}`);
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