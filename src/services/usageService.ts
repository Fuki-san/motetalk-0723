import { useAuth } from '../hooks/useAuth';
import { getAuth } from 'firebase/auth';

export interface UsageLimit {
  canUse: boolean;
  remainingUses: number;
  totalUses: number;
  plan: 'free' | 'premium';
}

export interface IncrementUsageResponse {
  success: boolean;
  remainingUses: number;
  totalUses: number;
}

// 認証トークンを取得
const getAuthToken = async (): Promise<string | null> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

// 使用回数制限をチェック
export const checkUsageLimit = async (): Promise<UsageLimit> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('認証トークンが取得できません');
    }

    const response = await fetch('/api/usage-limit', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('使用回数制限の確認に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('Usage limit check error:', error);
    // エラー時は無料プランとして扱う
    return {
      canUse: true,
      remainingUses: 3,
      totalUses: 3,
      plan: 'free'
    };
  }
};

// 使用回数を増加
export const incrementUsage = async (): Promise<IncrementUsageResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('認証トークンが取得できません');
    }

    const response = await fetch('/api/increment-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '使用回数の増加に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('Increment usage error:', error);
    throw error;
  }
};

// 使用回数制限の表示用テキストを生成
export const getUsageDisplayText = (usageLimit: UsageLimit): string => {
  if (usageLimit.plan === 'premium') {
    return 'プレミアムプラン: 無制限';
  }
  
  if (usageLimit.remainingUses === 0) {
    return '今月の使用回数上限に達しました';
  }
  
  return `残り${usageLimit.remainingUses}回 (今月${usageLimit.totalUses}回まで)`;
};

// 使用回数制限の警告メッセージを生成
export const getUsageWarningMessage = (usageLimit: UsageLimit): string | null => {
  if (usageLimit.plan === 'premium') {
    return null;
  }
  
  if (usageLimit.remainingUses === 0) {
    return '今月の使用回数上限に達しました。プレミアムプランにアップグレードして無制限でご利用ください。';
  }
  
  if (usageLimit.remainingUses <= 1) {
    return '残り使用回数が少なくなっています。プレミアムプランにアップグレードして無制限でご利用ください。';
  }
  
  return null;
}; 