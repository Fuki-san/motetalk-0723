const admin = require('firebase-admin');
require('dotenv').config({ path: './.env' });

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

async function fixTemplatePurchases() {
  try {
    console.log('🔧 テンプレート購入データの修正を開始...');
    
    // purchasesコレクションから全テンプレート購入を取得
    const purchasesSnapshot = await db.collection('purchases')
      .where('type', '==', 'template')
      .get();
    
    console.log(`📋 修正対象の購入データ数: ${purchasesSnapshot.docs.length}`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let deletedCount = 0;
    
    for (const doc of purchasesSnapshot.docs) {
      const data = doc.data();
      
      // templateIdが未設定の場合は削除
      if (!data.templateId) {
        await doc.ref.delete();
        console.log(`🗑️ 削除: ${doc.id} (templateId未設定)`);
        deletedCount++;
      } else {
        console.log(`⏭️ スキップ: ${doc.id} (templateId既存)`);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 削除完了:`);
    console.log(`- 削除: ${deletedCount}件`);
    console.log(`- スキップ: ${skippedCount}件`);
    
  } catch (error) {
    console.error('❌ 修正エラー:', error);
  } finally {
    process.exit(0);
  }
}

function getTemplateDisplayName(templateId) {
  const templateNames = {
    'first_message_pack': '初回メッセージ',
    'line_transition_pack': 'LINE移行',
    'date_invitation_pack': 'デート誘い',
    'conversation_topics_pack': '会話ネタ'
  };
  return templateNames[templateId] || 'テンプレートパック';
}

// スクリプト実行
fixTemplatePurchases(); 