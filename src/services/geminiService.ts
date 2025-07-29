import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Gemini API key is not configured');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

export interface ConversationTurn {
  userMessage: string;
  selectedReply?: string;
}

export interface GenerateRepliesRequest {
  currentMessage: string;
  conversationHistory: ConversationTurn[];
  userProfile?: {
    partnerName?: string;
    age?: number;
    interests?: string[];
    personality?: string;
    relationshipGoal?: 'casual' | 'serious' | 'friendship';
    communicationStyle?: 'polite' | 'casual' | 'funny';
    backgroundContext?: string;
  };
}

export interface GenerateRepliesResponse {
  replies: string[];
  success: boolean;
  error?: string;
}

export const generateReplies = async (
  request: GenerateRepliesRequest
): Promise<GenerateRepliesResponse> => {
  console.log('🔮 Gemini API呼び出し:', {
    messageLength: request.currentMessage.length,
    historyCount: request.conversationHistory.length,
    hasApiKey: !!API_KEY
  });
  
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 会話履歴を構築
    const conversationContext = request.conversationHistory
      .map((turn, index) => {
        return `${index + 1}回目のやり取り:
相手からのメッセージ: "${turn.userMessage}"
あなたの返信: "${turn.selectedReply || '未返信'}"`;
      })
      .join('\n\n');

    // ユーザープロフィール情報を構築
    const profileContext = request.userProfile ? `
【あなたの設定】
${request.userProfile.partnerName ? `相手の名前: ${request.userProfile.partnerName}` : ''}
${request.userProfile.age ? `あなたの年齢: ${request.userProfile.age}歳` : ''}
${request.userProfile.interests ? `あなたの趣味・興味: ${request.userProfile.interests.join('、')}` : ''}
${request.userProfile.relationshipGoal ? `関係性の目標: ${request.userProfile.relationshipGoal === 'casual' ? 'カジュアルな関係' : request.userProfile.relationshipGoal === 'serious' ? '真剣な交際' : '友達関係'}` : ''}
${request.userProfile.communicationStyle ? `コミュニケーションスタイル: ${request.userProfile.communicationStyle === 'polite' ? '丁寧' : request.userProfile.communicationStyle === 'casual' ? 'カジュアル' : 'ユーモア重視'}` : ''}
${request.userProfile.backgroundContext ? `※相手の雰囲気・背景状況: ${request.userProfile.backgroundContext}` : ''}
` : '';
    // プロンプトを構築
    const prompt = `あなたは20歳のモテる男子大学生です。
ノリが良くて、ユーモアやちょっとしたボケ・イジりを交えた軽い返信が得意です。
以下の相手のメッセージに対して、
・LINEっぽく自然に
・ちょっとふざけてて
・でも感じは良くて
・相手が返しやすいようなテンションで、3つの返信を考えてください。

会話を広げたり、ツッコミやボケで笑わせたりできるとベストです。
長文にならず、1〜2行のテンポ感を大切にしてください。

${profileContext}

${conversationContext ? `【これまでの会話履歴】\n${conversationContext}\n` : ''}

【今回の相手からのメッセージ】
"${request.currentMessage}"

【返信案を3つ提案してください】
返信内容のみを以下の形式で回答してください：

返信案1: （返信内容）

返信案2: （返信内容）

返信案3: （返信内容）`;

    // リトライ機能付きでAPI呼び出し
    const result = await retryApiCall(() => model.generateContent(prompt), 3);
    const response = await result.response;
    const text = response.text();

    // レスポンスをパース
    const replies = parseGeminiResponse(text);

    if (replies.length === 0) {
      throw new Error('返信案の生成に失敗しました');
    }

    return {
      replies,
      success: true
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // 503エラーの場合は特別なメッセージを表示
    if (error.message.includes('503') || error.message.includes('overloaded')) {
      console.warn('⚠️ Gemini APIが過負荷状態です。フォールバック返信を使用します。');
    }
    
    // フォールバック返信（開発・テスト用）
    const fallbackReplies = generateFallbackReplies(request.currentMessage);
    
    return {
      replies: fallbackReplies,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// リトライ機能付きAPI呼び出し
const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      // 503エラーまたは過負荷エラーの場合のみリトライ
      if (error instanceof Error && 
          (error.message.includes('503') || error.message.includes('overloaded'))) {
        
        console.warn(`⚠️ Gemini API過負荷 (試行 ${attempt}/${maxRetries})`);
        
        if (attempt < maxRetries) {
          // 指数バックオフで待機
          const waitTime = delay * Math.pow(2, attempt - 1);
          console.log(`⏳ ${waitTime}ms待機後にリトライ...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // その他のエラーは即座に投げる
      throw error;
    }
  }
  
  throw lastError!;
};

const parseGeminiResponse = (text: string): string[] => {
  const replies: string[] = [];
  
  // 返信案1、返信案2、返信案3のパターンを抽出
  const patterns = [
    /返信案1:\s*(.+?)(?=返信案2:|$)/s,
    /返信案2:\s*(.+?)(?=返信案3:|$)/s,
    /返信案3:\s*(.+?)$/s
  ];

  patterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match && match[1]) {
      const reply = match[1].trim()
        .replace(/^\[|\]$/g, '')
        .replace(/^（|）$/g, '')
        .replace(/^\"|\"$/g, '');
      if (reply) {
        replies.push(reply);
      }
    }
  });

  // パースに失敗した場合は、行ごとに分割して抽出を試行
  if (replies.length === 0) {
    const lines = text.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (line.includes('返信案') && line.includes(':')) {
        const reply = line.split(':')[1]?.trim()
          .replace(/^\[|\]$/g, '')
          .replace(/^（|）$/g, '')
          .replace(/^\"|\"$/g, '');
        if (reply && replies.length < 3) {
          replies.push(reply);
        }
      }
    });
  }

  return replies.slice(0, 3); // 最大3つまで
};

const generateFallbackReplies = (message: string): string[] => {
  // API失敗時のフォールバック返信
  return [
    `${message.slice(0, 20)}について詳しく聞かせてください！とても興味深いです。`,
    `そうなんですね！僕も似たような経験があって、共感できます。`,
    `面白いお話ですね。今度詳しくお聞かせいただけると嬉しいです。`
  ];
};