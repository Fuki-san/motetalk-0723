// 共通の型定義

// ユーザー関連
export interface User {
  uid: string;
  name: string;
  email: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  plan: 'free' | 'premium';
  subscriptionStatus?: string;
  purchasedTemplates: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 会話関連
export interface ConversationTurn {
  id: string;
  userMessage: string;
  aiReplies: string[];
  selectedReply: string;
  timestamp: Date;
}

export interface ConversationHistory {
  id: string;
  title: string;
  turns: ConversationTurn[];
  createdAt: Date;
  updatedAt: Date;
}

// 使用量関連
export interface UsageLimit {
  canUse: boolean;
  remainingUses: number;
  totalUses: number;
  plan: 'free' | 'premium';
}

// 設定関連
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
  };
  privacy: {
    saveConversationHistory: boolean;
  };
}

// API レスポンス関連
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 購入関連
export interface PurchaseHistory {
  subscriptions: SubscriptionHistory[];
  purchases: TemplatePurchase[];
}

export interface SubscriptionHistory {
  id: string;
  amount: number;
  createdAt: string;
}

export interface TemplatePurchase {
  id: string;
  templateId: string;
  templateName: string;
  amount: number;
  purchasedAt: string;
} 