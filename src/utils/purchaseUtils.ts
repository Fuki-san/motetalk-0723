import { templateCategories } from '../data/templateData';

/**
 * テンプレートIDから表示名を取得
 */
export const getTemplateDisplayName = (templateId: string): string => {
  const category = templateCategories.find(cat => cat.id === templateId);
  return category?.name || '不明なテンプレート';
};

/**
 * テンプレートIDから価格を取得
 */
export const getTemplatePrice = (templateId: string): number => {
  const category = templateCategories.find(cat => cat.id === templateId);
  return category?.price || 2500;
};

/**
 * テンプレートIDからpriceIdを取得
 */
export const getTemplatePriceId = (templateId: string): string => {
  const category = templateCategories.find(cat => cat.id === templateId);
  return category?.priceId || '';
};

/**
 * priceIdからテンプレートIDを特定
 */
export const getTemplateIdFromPriceId = (priceId: string): string | null => {
  const category = templateCategories.find(cat => cat.priceId === priceId);
  return category?.id || null;
};

/**
 * 購入履歴の重複を除去
 */
export const removeDuplicatePurchases = <T extends { stripeSessionId?: string; id: string }>(
  purchases: T[]
): T[] => {
  return purchases.filter((purchase, index, self) => {
    const currentKey = purchase.stripeSessionId || purchase.id;
    return index === self.findIndex(p => (p.stripeSessionId || p.id) === currentKey);
  });
};

/**
 * 購入履歴を日付でソート
 */
export const sortPurchasesByDate = <T extends { createdAt?: Date; purchasedAt?: Date }>(
  purchases: T[]
): T[] => {
  return purchases.sort((a, b) => {
    const dateA = a.purchasedAt || a.createdAt || new Date();
    const dateB = b.purchasedAt || b.createdAt || new Date();
    return dateB.getTime() - dateA.getTime();
  });
};

/**
 * 金額を数値として正規化
 */
export const normalizeAmount = (amount: any): number => {
  const num = Number(amount);
  return isNaN(num) ? 0 : num;
};

/**
 * 日付をISO文字列に変換
 */
export const formatDateToISO = (date: Date | any): string => {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (date?.toDate) {
    return date.toDate().toISOString();
  }
  return new Date().toISOString();
}; 