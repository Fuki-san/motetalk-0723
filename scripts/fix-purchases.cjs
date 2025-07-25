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

async function fixPurchases() {
  try {
    console.log('🔧 購入データの修正を開始...');
    
    // 特定のユーザーの購入データを取得
    const userId = 'xQr1lRF8aRUcXmAWvlATmGsUZyo1';
    
    const purchasesQuery = await db.collection('purchases')
      .where('userId', '==', userId)
      .get();
    
    console.log(`📊 ユーザー ${userId} の購入データ数: ${purchasesQuery.size}`);
    
    let updateCount = 0;
    
    for (const doc of purchasesQuery.docs) {
      const data = doc.data();
      console.log(`\n📋 購入データ ${doc.id}:`);
      console.log('  現在のtemplateId:', data.templateId);
      console.log('  金額:', data.amount);
      console.log('  作成日時:', data.createdAt);
      
      // 購入順序に基づいてtemplateIdを設定
      // 最初の購入: first_message_pack
      // 2番目の購入: date_invitation_pack
      // 3番目の購入: conversation_topics_pack
      let newTemplateId = null;
      
      if (updateCount === 0) {
        newTemplateId = 'first_message_pack';
      } else if (updateCount === 1) {
        newTemplateId = 'date_invitation_pack';
      } else if (updateCount === 2) {
        newTemplateId = 'conversation_topics_pack';
      }
      
      if (newTemplateId && data.templateId !== newTemplateId) {
        console.log(`  🔄 templateIdを更新: ${data.templateId} -> ${newTemplateId}`);
        
        await doc.ref.update({
          templateId: newTemplateId,
          templateName: getTemplateDisplayName(newTemplateId)
        });
        
        console.log(`  ✅ 更新完了: ${newTemplateId}`);
        updateCount++;
      } else {
        console.log(`  ⏭️  スキップ: 既に正しいtemplateId`);
      }
    }
    
    console.log(`\n🎉 修正完了: ${updateCount} 件のデータを更新`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
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
  return templateNames[templateId] || templateId;
}

fixPurchases(); 