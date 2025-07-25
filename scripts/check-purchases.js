const admin = require('firebase-admin');

// Firebase初期化（実際の環境に合わせて設定）
const serviceAccount = require('../path/to/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkPurchases() {
  try {
    console.log('🔍 購入データの状況を確認中...');
    
    // 特定のユーザーの購入データを確認
    const userId = 'DjtkBLZApbb94k85wBtj14rHBVD3'; // ログから取得したユーザーID
    
    // purchasesコレクションから取得
    const purchasesSnapshot = await db.collection('purchases')
      .where('userId', '==', userId)
      .where('type', '==', 'template')
      .get();
    
    console.log(`\n📋 ユーザー ${userId} の購入データ:`);
    console.log(`- 購入数: ${purchasesSnapshot.docs.length}`);
    
    purchasesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. 購入ID: ${doc.id}`);
      console.log(`   - templateId: ${data.templateId || '未設定'}`);
      console.log(`   - templateName: ${data.templateName || '未設定'}`);
      console.log(`   - amount: ${data.amount}`);
      console.log(`   - createdAt: ${data.createdAt?.toDate() || '不明'}`);
      console.log(`   - stripeSessionId: ${data.stripeSessionId || '不明'}`);
    });
    
    // template_purchasesコレクションからも取得
    const templatePurchasesSnapshot = await db.collection('template_purchases')
      .where('userId', '==', userId)
      .get();
    
    console.log(`\n📋 template_purchasesコレクション:`);
    console.log(`- 購入数: ${templatePurchasesSnapshot.docs.length}`);
    
    templatePurchasesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. 購入ID: ${doc.id}`);
      console.log(`   - templateId: ${data.templateId || '未設定'}`);
      console.log(`   - templateName: ${data.templateName || '未設定'}`);
      console.log(`   - amount: ${data.amount}`);
      console.log(`   - purchasedAt: ${data.purchasedAt?.toDate() || '不明'}`);
    });
    
    // ユーザー情報も確認
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log(`\n👤 ユーザー情報:`);
      console.log(`   - plan: ${userData.plan}`);
      console.log(`   - purchasedTemplates: ${JSON.stringify(userData.purchasedTemplates)}`);
    }
    
  } catch (error) {
    console.error('❌ 確認エラー:', error);
  } finally {
    process.exit(0);
  }
}

// スクリプト実行
checkPurchases(); 