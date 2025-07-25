import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTemplateDisplayName, getTemplatePrice, removeDuplicatePurchases } from '../utils/purchaseUtils';

// モックデータ
const mockPurchases = [
  {
    id: '1',
    templateId: 'first_message_pack',
    stripeSessionId: 'session_123',
    amount: 2500,
    createdAt: new Date('2025-01-25T10:00:00Z')
  },
  {
    id: '2',
    templateId: 'first_message_pack',
    stripeSessionId: 'session_123', // 重複
    amount: 2500,
    createdAt: new Date('2025-01-25T10:00:00Z')
  },
  {
    id: '3',
    templateId: 'line_transition_pack',
    stripeSessionId: 'session_456',
    amount: 2500,
    createdAt: new Date('2025-01-25T11:00:00Z')
  }
];

describe('購入関連ユーティリティ', () => {
  describe('getTemplateDisplayName', () => {
    it('正しいテンプレート名を返す', () => {
      expect(getTemplateDisplayName('first_message_pack')).toBe('初回メッセージ');
      expect(getTemplateDisplayName('line_transition_pack')).toBe('LINE移行');
      expect(getTemplateDisplayName('date_invitation_pack')).toBe('デート誘い');
      expect(getTemplateDisplayName('conversation_topics_pack')).toBe('会話ネタ');
    });

    it('存在しないテンプレートIDの場合はデフォルト値を返す', () => {
      expect(getTemplateDisplayName('unknown_pack')).toBe('不明なテンプレート');
    });
  });

  describe('getTemplatePrice', () => {
    it('正しい価格を返す', () => {
      expect(getTemplatePrice('first_message_pack')).toBe(2500);
      expect(getTemplatePrice('line_transition_pack')).toBe(2500);
      expect(getTemplatePrice('date_invitation_pack')).toBe(2500);
      expect(getTemplatePrice('conversation_topics_pack')).toBe(2500);
    });

    it('存在しないテンプレートIDの場合はデフォルト値を返す', () => {
      expect(getTemplatePrice('unknown_pack')).toBe(2500);
    });
  });

  describe('removeDuplicatePurchases', () => {
    it('重複する購入を除去する', () => {
      const result = removeDuplicatePurchases(mockPurchases);
      expect(result).toHaveLength(2);
      expect(result[0].stripeSessionId).toBe('session_123');
      expect(result[1].stripeSessionId).toBe('session_456');
    });

    it('stripeSessionIdがない場合はidで重複除去', () => {
      const purchasesWithoutSessionId = [
        { id: '1', templateId: 'test', amount: 2500 },
        { id: '1', templateId: 'test', amount: 2500 }, // 重複
        { id: '2', templateId: 'test2', amount: 2500 }
      ];
      
      const result = removeDuplicatePurchases(purchasesWithoutSessionId);
      expect(result).toHaveLength(2);
    });

    it('空の配列の場合は空の配列を返す', () => {
      const result = removeDuplicatePurchases([]);
      expect(result).toHaveLength(0);
    });
  });
}); 