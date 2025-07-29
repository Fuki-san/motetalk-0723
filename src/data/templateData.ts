import { MessageCircle, Heart, Coffee, Star, Crown } from 'lucide-react';

export interface Template {
  id: string;
  content: string;
  category: string;
  isPreview?: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  icon: React.ComponentType<any>;
  templates: Template[];
}

// テンプレートデータ
// 2025-01-28: 15選の魅力的なテンプレートに更新
export const templateCategories: TemplateCategory[] = [
  {
    id: 'first_message_pack',
    name: '初回メッセージ',
    description: 'Tinder・タップル用の返信率が高い初回メッセージ15種類',
    price: 2500,
    priceId: 'price_1Rl6WZQoDVsMq3SibYnakW14',
    icon: MessageCircle,
    templates: [
      {
        id: 'first_1',
        content: '初めまして！写真めっちゃ可愛いですね！',
        category: 'first_message_pack',
        isPreview: true
      },
      {
        id: 'first_2',
        content: '初めまして！雰囲気可愛すぎて好きです',
        category: 'first_message_pack',
      },
      {
        id: 'first_3',
        content: '初めまして！服めっちゃオシャレですね',
        category: 'first_message_pack',
      },
      {
        id: 'first_4',
        content: '初めまして！透明感エグいですね、、',
        category: 'first_message_pack',
      },
      {
        id: 'first_5',
        content: '初めまして！笑顔にやられました笑好きです',
        category: 'first_message_pack',
      },
      {
        id: 'first_6',
        content: '初めまして！オーラ強すぎて目に止まりました笑',
        category: 'first_message_pack',
      },
      {
        id: 'first_7',
        content: '初めまして！清楚そうなのにちょっとギャルっぽい感じが好きです',
        category: 'first_message_pack',
      },
      {
        id: 'first_8',
        content: '初めまして！髪型めっちゃ似合ってて可愛いです',
        category: 'first_message_pack',
      },
      {
        id: 'first_9',
        content: '初めまして！距離めっちゃ近いですね笑会って話してみたいです！',
        category: 'first_message_pack',
      },
      {
        id: 'first_10',
        content: '初めまして！〇〇好きなんですね、自分もめっちゃ好きです！',
        category: 'first_message_pack',
      },
      {
        id: 'first_11',
        content: '初めまして！趣味センス良すぎません？話合いそうです笑',
        category: 'first_message_pack',
      },
      {
        id: 'first_12',
        content: '初めまして！〇〇同士、絶対話し合いなと思いました笑',
        category: 'first_message_pack',
      },
      {
        id: 'first_13',
        content: '初めまして！レベチで可愛すぎません？笑',
        category: 'first_message_pack',
      },
      {
        id: 'first_14',
        content: '初めまして！あんま言わないんですけど、めっちゃ可愛いですね笑',
        category: 'first_message_pack',
      },
      {
        id: 'first_15',
        content: '初めまして！マッチありがとうございます。仲良くなれたら嬉しいです！',
        category: 'first_message_pack',
      }
    ]
  },
  {
    id: 'date_invitation_pack',
    name: 'デート誘い',
    description: '自然で断られにくいデート誘いメッセージ15種類',
    price: 2500,
    priceId: 'price_1Roiu5QoDVsMq3SiYXbdh2xT',
    icon: Coffee,
    templates: [
      {
        id: 'date_1',
        content: '絶対楽しい気しかしない、リアルでも話してみたい笑',
        category: 'date_invitation_pack',
        isPreview: true
      },
      {
        id: 'date_2',
        content: '気が合いそうだから、一回話してみたいなって思って！',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_3',
        content: 'こんな話できる人初めてかも！リアルでも話してみたい笑',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_4',
        content: 'カフェ好きって言ってたけど、よかったら一緒に行こうよ',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_5',
        content: 'ご飯派？カフェ派？今度どっちか行こ笑',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_6',
        content: 'お酒いけるタイプ？一緒に飲も〜',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_7',
        content: '普通に会ってみたいって思ったの初めてかも笑',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_8',
        content: '週末とか空いてたらご飯行こうよ〜',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_9',
        content: '今度よかったらご飯でも行きません？',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_10',
        content: '近くっぽいし、会える距離なのいいなって思った！',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_11',
        content: '今度時間あったら、ちょっとだけでも会って話そ！',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_12',
        content: '10分だけでいいから電話したいな',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_13',
        content: '〇〇のお店めっちゃうまいんだけど、一緒に行こ〜',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_14',
        content: 'ちょっと行ってみたいカフェあるんだけど、付き合ってくれる？笑',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_15',
        content: '写真の雰囲気的に、一緒にいると楽しそうな気しかしない笑　今度会ってみよ！',
        category: 'date_invitation_pack',
      }
    ]
  },
  {
    id: 'conversation_topics_pack',
    name: '会話ネタ',
    description: '会話が続く話題とボケ例15種類',
    price: 2500,
    priceId: 'price_1RoiuyQoDVsMq3Si9MQuzT6x',
    icon: Star,
    templates: [
      {
        id: 'conversation_1',
        content: '誰かに似てるって言われたことない？笑',
        category: 'conversation_topics_pack',
        isPreview: true
      },
      {
        id: 'conversation_2',
        content: '週末って何してるの？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_3',
        content: '何系で働いてるの？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_4',
        content: '旅行とか好き？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_5',
        content: '好きな芸能人とかタイプってどんな感じ？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_6',
        content: '何食べるの好き？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_7',
        content: 'バイト何してたの？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_8',
        content: 'サークル入ってた？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_9',
        content: 'どれくらい彼氏いないの？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_10',
        content: 'お酒飲める？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_11',
        content: 'ロングって可愛い人しかいないよね笑',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_12',
        content: '地元どこ〜？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_13',
        content: '普段どんな曲聴いてる？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_14',
        content: '〇〇って話してて思ったけど、絶対〇〇タイプだよね？合ってる？笑',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_15',
        content: '〇〇で会ったの何回目？',
        category: 'conversation_topics_pack',
      }
    ]
  }
];

// テンプレート表示名を取得する関数
export const getTemplateDisplayName = (templateId: string): string => {
  const template = templateCategories.find(t => t.id === templateId);
  return template ? template.name : 'Unknown Template';
};

// テンプレート価格を取得する関数
export const getTemplatePrice = (templateId: string): number => {
  const template = templateCategories.find(t => t.id === templateId);
  return template ? template.price : 0;
};

// テンプレート説明を取得する関数
export const getTemplateDescription = (templateId: string): string => {
  const template = templateCategories.find(t => t.id === templateId);
  return template ? template.description : '';
};

// テンプレートアイコンを取得する関数
export const getTemplateIcon = (templateId: string): React.ComponentType<any> => {
  const template = templateCategories.find(t => t.id === templateId);
  return template ? template.icon : MessageCircle;
}; 