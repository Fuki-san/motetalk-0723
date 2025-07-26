import { getAuth } from 'firebase/auth';

export interface ConversationHistory {
  id: string;
  title: string;
  turns: ConversationTurn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationTurn {
  id: string;
  userMessage: string;
  aiReplies: string[];
  selectedReply: string;
  timestamp: Date;
}

// 会話履歴を保存
export const saveConversation = async (
  title: string,
  turns: ConversationTurn[]
): Promise<boolean> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('ユーザーが認証されていません');
      return false;
    }

    const token = await user.getIdToken();
    if (!token) {
      console.warn('認証トークンが取得できません');
      return false;
    }

    console.log('💾 会話履歴を保存中:', title);
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        turns: turns.map(turn => ({
          ...turn,
          timestamp: turn.timestamp.toISOString()
        }))
      }),
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('✅ 会話履歴保存成功:', result);
    return true;
  } catch (error) {
    console.error('❌ 会話履歴保存エラー:', error);
    return false;
  }
};

// 会話履歴一覧を取得
export const getConversationList = async (): Promise<ConversationHistory[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('ユーザーが認証されていません');
      return [];
    }

    const token = await user.getIdToken();
    if (!token) {
      console.warn('認証トークンが取得できません');
      return [];
    }

    console.log('📋 会話履歴一覧を取得中');
    const response = await fetch('/api/conversations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return [];
    }

    const result = await response.json();
    console.log('✅ 会話履歴一覧取得成功:', result);
    
    return result.conversations.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      turns: conv.turns.map((turn: any) => ({
        ...turn,
        timestamp: new Date(turn.timestamp)
      }))
    }));
  } catch (error) {
    console.error('❌ 会話履歴一覧取得エラー:', error);
    return [];
  }
};

// 特定の会話履歴を取得
export const getConversation = async (id: string): Promise<ConversationHistory | null> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('ユーザーが認証されていません');
      return null;
    }

    const token = await user.getIdToken();
    if (!token) {
      console.warn('認証トークンが取得できません');
      return null;
    }

    console.log('📖 会話履歴を取得中:', id);
    const response = await fetch(`/api/conversations/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    console.log('✅ 会話履歴取得成功:', result);
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
      turns: result.turns.map((turn: any) => ({
        ...turn,
        timestamp: new Date(turn.timestamp)
      }))
    };
  } catch (error) {
    console.error('❌ 会話履歴取得エラー:', error);
    return null;
  }
};

// 会話履歴を削除
export const deleteConversation = async (id: string): Promise<boolean> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('ユーザーが認証されていません');
      return false;
    }

    const token = await user.getIdToken();
    if (!token) {
      console.warn('認証トークンが取得できません');
      return false;
    }

    console.log('🗑️ 会話履歴を削除中:', id);
    const response = await fetch(`/api/conversations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return false;
    }

    console.log('✅ 会話履歴削除成功');
    return true;
  } catch (error) {
    console.error('❌ 会話履歴削除エラー:', error);
    return false;
  }
}; 