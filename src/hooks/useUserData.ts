import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getAuth } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  plan: 'free' | 'premium';
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  purchasedTemplates: string[];
}

export const useUserData = () => {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (authUser) {
        try {
          // 実際のAPIからユーザー情報を取得
          const currentUser = getAuth().currentUser;
          if (!currentUser) {
            throw new Error('No authenticated user');
          }

          const token = await currentUser.getIdToken();
          
          // ユーザープロフィールを取得
          const profileResponse = await fetch('/api/user-profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUserProfile(profileData);
          } else {
            // APIエラー時はデフォルト値を設定
            console.warn('Failed to load user profile, using default values');
            setUserProfile({
              uid: authUser.uid,
              email: authUser.email || '',
              name: authUser.name || 'ユーザー',
              photoURL: authUser.photoURL,
              plan: 'free' as const,
              subscriptionStatus: undefined,
              purchasedTemplates: []
            });
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
          // エラー時のフォールバック
          setUserProfile({
            uid: authUser.uid,
            email: authUser.email || '',
            name: authUser.name || 'ユーザー',
            photoURL: authUser.photoURL,
            plan: 'free' as const,
            subscriptionStatus: undefined,
            purchasedTemplates: []
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    };

    loadUserData();
  }, [authUser]);

  const updateUserPlan = async (plan: 'free' | 'premium', subscriptionData?: any) => {
    if (authUser) {
      // 実際の実装ではAPIを呼び出してデータベースを更新
      setUserProfile(prev => prev ? {
        ...prev,
        plan,
        ...subscriptionData
      } : null);
    }
  };

  const addPurchasedTemplate = async (templateId: string) => {
    if (authUser) {
      // 実際の実装ではAPIを呼び出してデータベースを更新
      setUserProfile(prev => prev ? {
        ...prev,
        purchasedTemplates: [...prev.purchasedTemplates, templateId]
      } : null);
    }
  };

  return {
    userProfile,
    loading,
    updateUserPlan,
    addPurchasedTemplate
  };
};