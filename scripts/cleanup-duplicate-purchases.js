import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Admin初期化
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function cleanupDuplicatePurchases() {
  try {
    console.log('🧹 重複購入データのクリーンアップを開始...');
    
    // 全ユーザーの購入データを取得
    const purchasesSnapshot = await db.collection('purchases').get();
    const purchases = purchasesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 総購入データ数: ${purchases.length}`);
    
    // stripeSessionIdでグループ化
    const groupedBySession = {};
    const duplicates = [];
    
    purchases.forEach(purchase => {
      const sessionId = purchase.stripeSessionId;
      if (sessionId) {
        if (!groupedBySession[sessionId]) {
          groupedBySession[sessionId] = [];
        }
        groupedBySession[sessionId].push(purchase);
      }
    });
    
    // 重複を特定
    Object.entries(groupedBySession).forEach(([sessionId, purchases]) => {
      if (purchases.length > 1) {
        console.log(`🔍 重複発見: ${sessionId} (${purchases.length}件)`);
        duplicates.push(...purchases.slice(1)); // 最初以外を重複として扱う
      }
    });
    
    console.log(`🗑️ 削除対象: ${duplicates.length}件`);
    
    // 重複データを削除
    for (const duplicate of duplicates) {
      console.log(`🗑️ 削除: ${duplicate.id} (${duplicate.templateId})`);
      await db.collection('purchases').doc(duplicate.id).delete();
    }
    
    console.log('✅ 重複データのクリーンアップ完了');
    
  } catch (error) {
    console.error('❌ クリーンアップエラー:', error);
  }
}

// スクリプト実行
cleanupDuplicatePurchases().then(() => {
  console.log('🏁 スクリプト完了');
  process.exit(0);
}).catch(error => {
  console.error('❌ スクリプトエラー:', error);
  process.exit(1);
}); 