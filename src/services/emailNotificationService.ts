// メール通知サービス
export class EmailNotificationService {
  private static instance: EmailNotificationService;

  private constructor() {}

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  // メール通知の有効化
  async enableEmailNotifications(userId: string, email: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch('/api/email-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          email,
          enabled: true
        }),
      });

      if (response.ok) {
        console.log('✅ メール通知を有効化しました');
        return true;
      } else {
        console.error('❌ メール通知の有効化に失敗しました');
        return false;
      }
    } catch (error) {
      console.error('❌ メール通知有効化エラー:', error);
      return false;
    }
  }

  // メール通知の無効化
  async disableEmailNotifications(userId: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch('/api/email-subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId
        }),
      });

      if (response.ok) {
        console.log('✅ メール通知を無効化しました');
        return true;
      } else {
        console.error('❌ メール通知の無効化に失敗しました');
        return false;
      }
    } catch (error) {
      console.error('❌ メール通知無効化エラー:', error);
      return false;
    }
  }

  // メール通知の状態確認
  async getEmailNotificationStatus(userId: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`/api/email-subscription/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.enabled || false;
      } else {
        console.error('❌ メール通知状態の取得に失敗しました');
        return false;
      }
    } catch (error) {
      console.error('❌ メール通知状態確認エラー:', error);
      return false;
    }
  }

  // 認証トークンを取得
  private async getAuthToken(): Promise<string> {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('ユーザーが認証されていません');
    }
    
    const token = await currentUser.getIdToken();
    if (!token) {
      throw new Error('認証トークンが取得できません');
    }
    
    return token;
  }
}

// シングルトンインスタンスをエクスポート
export const emailNotificationService = EmailNotificationService.getInstance(); 