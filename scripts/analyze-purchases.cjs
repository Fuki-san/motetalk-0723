const admin = require('firebase-admin');
require('dotenv').config({ path: '../.env' });

// Firebase初期化
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = admin.firestore();

async function analyzePurchases() {
  try {
    console.log('🔍 購入データの詳細分析を開始...');
    
    // 特定のユーザーの購入データを取得
    const userId = 'xQr1lRF8aRUcXmAWvlATmGsUZyo1'; // 新しいユーザーID
    
    const purchasesQuery = await db.collection('purchases')
      .where('userId', '==', userId)
      .get();
    
    console.log(`📊 ユーザー ${userId} の購入データ数: ${purchasesQuery.size}`);
    
    for (const doc of purchasesQuery.docs) {
      const data = doc.data();
      console.log('\n📋 購入データ詳細:');
      console.log('  ID:', doc.id);
      console.log('  Stripe Session ID:', data.stripeSessionId);
      console.log('  Amount:', data.amount);
      console.log('  Template ID:', data.templateId);
      console.log('  Template Name:', data.templateName);
      console.log('  Type:', data.type);
      console.log('  Customer Email:', data.customerEmail);
      console.log('  Created At:', data.createdAt?.toDate());
      
      // Stripe Session IDがある場合は、Stripeから詳細情報を取得
      if (data.stripeSessionId) {
        console.log('  🔍 Stripe Session IDから詳細情報を取得中...');
        // ここでStripe APIを使用してセッション詳細を取得できる
        // ただし、Stripe APIキーが必要
      }
    }
    
    // template_purchasesコレクションも確認
    const templatePurchasesQuery = await db.collection('template_purchases')
      .where('userId', '==', userId)
      .get();
    
    console.log(`\n📊 template_purchasesコレクションのデータ数: ${templatePurchasesQuery.size}`);
    
    for (const doc of templatePurchasesQuery.docs) {
      const data = doc.data();
      console.log('\n📋 Template Purchase詳細:');
      console.log('  ID:', doc.id);
      console.log('  Template ID:', data.templateId);
      console.log('  Template Name:', data.templateName);
      console.log('  Amount:', data.amount);
      console.log('  Type:', data.type);
      console.log('  Purchased At:', data.purchasedAt?.toDate());
    }
    
  } catch (error) {
    console.error('❌ 分析エラー:', error);
  } finally {
    process.exit(0);
  }
}

analyzePurchases(); 