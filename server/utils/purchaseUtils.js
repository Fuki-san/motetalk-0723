/**
 * テンプレートIDから表示名を取得
 */
function getTemplateDisplayName(templateId) {
  const templateNames = {
    'first_message_pack': '初回メッセージ',
    'line_transition_pack': 'LINE移行',
    'date_invitation_pack': 'デート誘い',
    'conversation_topics_pack': '会話ネタ'
  };
  return templateNames[templateId] || '不明なテンプレート';
}

/**
 * テンプレートIDから価格を取得
 */
function getTemplatePrice(templateId) {
  const templatePrices = {
    'first_message_pack': 2500,
    'line_transition_pack': 2500,
    'date_invitation_pack': 2500,
    'conversation_topics_pack': 2500
  };
  return templatePrices[templateId] || 2500;
}

/**
 * priceIdからテンプレートIDを特定
 */
function getTemplateIdFromPriceId(priceId) {
  const priceIdMap = {
    'price_1Rl6WZQoDVsMq3SibYnakW14': 'first_message_pack',
    'price_1Roiu5QoDVsMq3SiYXbdh2xT': 'date_invitation_pack',
    'price_1RoiuyQoDVsMq3Si9MQuzT6x': 'conversation_topics_pack'
  };
  return priceIdMap[priceId] || null;
}

/**
 * 購入履歴の重複を除去
 */
function removeDuplicatePurchases(purchases) {
  const seen = new Set();
  return purchases.filter(purchase => {
    // stripeSessionIdがある場合はそれを使用、ない場合はidを使用
    const key = purchase.stripeSessionId || purchase.id;
    if (seen.has(key)) {
      console.log('🔍 重複を除去:', key);
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * 購入履歴を日付でソート
 */
function sortPurchasesByDate(purchases) {
  return purchases.sort((a, b) => {
    const dateA = a.purchasedAt || a.createdAt || new Date();
    const dateB = b.purchasedAt || b.createdAt || new Date();
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * 金額を数値として正規化
 */
function normalizeAmount(amount) {
  const num = Number(amount);
  return isNaN(num) ? 0 : num;
}

/**
 * 日付をISO文字列に変換
 */
function formatDateToISO(date) {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (date?.toDate) {
    return date.toDate().toISOString();
  }
  return new Date().toISOString();
}

/**
 * 日付を日本語形式に変換（時間付き）
 */
function formatDateToJapanese(date) {
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (date?.toDate) {
    dateObj = date.toDate();
  } else {
    dateObj = new Date(date);
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

export {
  getTemplateDisplayName,
  getTemplatePrice,
  getTemplateIdFromPriceId,
  removeDuplicatePurchases,
  sortPurchasesByDate,
  normalizeAmount,
  formatDateToISO,
  formatDateToJapanese
}; 