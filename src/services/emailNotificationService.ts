import { apiCall } from './authUtils';

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
      await apiCall('/api/email-subscription', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          email,
          enabled: true
        }),
      });
      console.log('✅ メール通知を有効化しました');
      return true;
    } catch (error) {
      console.error('❌ メール通知有効化エラー:', error);
      return false;
    }
  }

  // メール通知の無効化
  async disableEmailNotifications(userId: string): Promise<boolean> {
    try {
      await apiCall('/api/email-subscription', {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });
      console.log('✅ メール通知を無効化しました');
      return true;
    } catch (error) {
      console.error('❌ メール通知無効化エラー:', error);
      return false;
    }
  }

  // メール通知の状態確認
  async getEmailNotificationStatus(userId: string): Promise<boolean> {
    try {
      const data = await apiCall<{ enabled: boolean }>(`/api/email-subscription/${userId}`);
      return data.enabled || false;
    } catch (error) {
      console.error('❌ メール通知状態確認エラー:', error);
      return false;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const emailNotificationService = EmailNotificationService.getInstance(); 