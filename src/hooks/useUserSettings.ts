import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { pushNotificationService } from '../services/pushNotificationService';
import { emailNotificationService } from '../services/emailNotificationService';
import { getAuth } from 'firebase/auth';

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
  };
  privacy: {
    saveConversationHistory: boolean;
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: false,
  },
  privacy: {
    saveConversationHistory: true,
  },
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ユーザー設定を読み込み
  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          // Firestoreから設定を読み込み
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data()?.settings) {
            const firestoreSettings = userDoc.data().settings;
            setSettings({
              notifications: {
                email: firestoreSettings.notifications?.email ?? defaultSettings.notifications.email,
                push: firestoreSettings.notifications?.push ?? defaultSettings.notifications.push,
              },
              privacy: {
                saveConversationHistory: firestoreSettings.privacy?.saveConversationHistory ?? defaultSettings.privacy.saveConversationHistory,
              },
            });
          } else {
            // 新規ユーザーの場合、デフォルト設定をFirestoreに保存
            console.log('🆕 新規ユーザーの設定を初期化:', user.uid);
            await setDoc(doc(db, 'users', user.uid), {
              settings: defaultSettings,
              updatedAt: serverTimestamp()
            }, { merge: true });
            setSettings(defaultSettings);
          }
        } catch (error) {
          console.error('Failed to load user settings:', error);
          // エラー時はデフォルト設定を使用
          setSettings(defaultSettings);
          // エラーの詳細をログに出力
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              name: error.name,
              stack: error.stack
            });
          }
        }
      }
      setLoading(false);
    };

    loadSettings();
  }, [user]);

  // 設定を保存
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
        notifications: {
          ...settings.notifications,
          ...newSettings.notifications,
        },
        privacy: {
          ...settings.privacy,
          ...newSettings.privacy,
        },
      };

      // Firestoreに保存（存在しない場合は作成、存在する場合は更新）
      await setDoc(doc(db, 'users', user.uid), {
        settings: updatedSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSettings(updatedSettings);

      // 設定変更に応じた処理を実行
      await applySettingsChanges(updatedSettings);

      console.log('✅ 設定が保存されました:', updatedSettings);
    } catch (error) {
      console.error('❌ 設定の保存に失敗しました:', error);
      // エラーの詳細をログに出力
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // 設定変更を適用
  const applySettingsChanges = async (newSettings: UserSettings) => {
    if (!user) return;

    // メール通知設定
    if (newSettings.notifications.email) {
      console.log('📧 メール通知を有効化');
      try {
        await emailNotificationService.enableEmailNotifications(user.uid, user.email);
      } catch (error) {
        console.error('❌ メール通知の有効化に失敗:', error);
      }
    } else {
      console.log('📧 メール通知を無効化');
      try {
        await emailNotificationService.disableEmailNotifications(user.uid);
      } catch (error) {
        console.error('❌ メール通知の無効化に失敗:', error);
      }
    }

    // プッシュ通知設定
            if (newSettings.notifications.push) {
          console.log('🔔 プッシュ通知を有効化');
          try {
            // Service Workerを登録
            const registered = await pushNotificationService.registerServiceWorker();
            if (registered) {
              // プッシュ通知の許可を要求
              const permission = await pushNotificationService.requestPermission();
              if (permission === 'granted') {
                // プッシュ通知を購読
                const subscription = await pushNotificationService.subscribeToPush();
                if (subscription) {
                  // サーバーに購読情報を送信
                  const auth = getAuth();
                  const currentUser = auth.currentUser;
                  if (!currentUser) {
                    throw new Error('ユーザーが認証されていません');
                  }
                  
                  const token = await currentUser.getIdToken();
                  await fetch('/api/push-subscription', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      subscription: subscription.toJSON()
                    }),
                  });
                  console.log('✅ プッシュ通知を有効化しました');
                }
              }
            }
          } catch (error) {
            console.error('❌ プッシュ通知の有効化に失敗:', error);
          }
        } else {
          console.log('🔔 プッシュ通知を無効化');
          try {
            // プッシュ通知の購読を解除
            await pushNotificationService.unsubscribeFromPush();
            
            // サーバーから購読情報を削除
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser) {
              throw new Error('ユーザーが認証されていません');
            }
            
            const token = await currentUser.getIdToken();
            await fetch('/api/push-subscription', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
            console.log('✅ プッシュ通知を無効化しました');
          } catch (error) {
            console.error('❌ プッシュ通知の無効化に失敗:', error);
          }
        }

    // 会話履歴保存設定
    if (!newSettings.privacy.saveConversationHistory) {
      console.log('🗑️ 既存の会話履歴を削除');
      try {
        // バックエンドAPIを呼び出して会話履歴を削除
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('ユーザーが認証されていません');
        }
        
        const token = await currentUser.getIdToken();
        const response = await fetch('/api/delete-conversations', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          console.log('✅ 会話履歴を削除しました');
        } else {
          console.error('❌ 会話履歴の削除に失敗しました');
        }
      } catch (error) {
        console.error('❌ 会話履歴削除エラー:', error);
      }
    }
  };

  // 個別設定更新用のヘルパー関数
  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: boolean) => {
    updateSettings({
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    });
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    updateNotificationSetting,
    updatePrivacySetting,
  };
};