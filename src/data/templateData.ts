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
  icon: React.ComponentType<any>;
  templates: Template[];
}

// テンプレートデータ
export const templateCategories: TemplateCategory[] = [
  {
    id: 'first_message_pack',
    name: '初回メッセージ',
    description: 'Tinder・タップル用の返信率が高い初回メッセージ30種類',
    price: 980,
    icon: MessageCircle,
    templates: [
      {
        id: 'first_1',
        content: 'はじめまして！プロフィールを拝見して、[趣味]をされているのを見て親近感を感じました。僕も[関連する経験]をしていて、とても興味深いです。よろしければお話しさせていただけませんか？',
        category: 'first_message_pack',
        isPreview: true
      },
      {
        id: 'first_2',
        content: '[場所]の写真、とても素敵ですね！雰囲気がすごく良くて、きっと楽しい時間を過ごされたんだろうなと思いました。僕も[関連する場所や体験]が好きで、お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_3',
        content: 'こんにちは！プロフィール見させていただきました。[具体的な共通点]について、とても興味があります。もしよろしければ、お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_4',
        content: 'プロフィール拝見しました！[具体的な印象]で、とても魅力的だなと思いました。よろしければ、お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_5',
        content: 'はじめまして！[共通の趣味や関心]について、とても興味があります。お話しできればと思います。',
        category: 'first_message_pack',
      }
    ]
  },
  {
    id: 'line_transition_pack',
    name: 'LINE移行',
    description: 'アプリからLINEへの自然な移行メッセージ30種類',
    price: 980,
    icon: Heart,
    templates: [
      {
        id: 'line_1',
        content: 'お話しできて楽しかったです！もしよろしければ、LINEでもお話しできませんか？ID: [LINE_ID]',
        category: 'line_transition_pack',
        isPreview: true
      },
      {
        id: 'line_2',
        content: 'とても興味深いお話でした。LINEでも続きを聞かせてください！ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_3',
        content: 'お話しできて嬉しかったです。LINEでもお話しできればと思います。ID: [LINE_ID]',
        category: 'line_transition_pack',
      }
    ]
  },
  {
    id: 'date_invitation_pack',
    name: 'デート誘い',
    description: '自然で断られにくいデート誘いメッセージ30種類',
    price: 980,
    icon: Coffee,
    templates: [
      {
        id: 'date_1',
        content: 'もしよろしければ、今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
        isPreview: true
      },
      {
        id: 'date_2',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_3',
        content: '今度一緒に[アクティビティ]をしませんか？とても楽しいと思います。',
        category: 'date_invitation_pack',
      }
    ]
  },
  {
    id: 'conversation_topics_pack',
    name: '会話ネタ',
    description: '会話が続く話題とネタ30種類',
    price: 980,
    icon: Star,
    templates: [
      {
        id: 'topic_1',
        content: '最近何か新しいことに挑戦されていますか？私は[具体的な挑戦]を始めました。',
        category: 'conversation_topics_pack',
        isPreview: true
      },
      {
        id: 'topic_2',
        content: '休日はどのように過ごされることが多いですか？私は[具体的な過ごし方]が好きです。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_3',
        content: 'お気に入りの[カテゴリ]はありますか？私は[具体的な好み]が好きです。',
        category: 'conversation_topics_pack',
      }
    ]
  },
  {
    id: 'premium_pack',
    name: 'プレミアム',
    description: 'プレミアムユーザー専用の高品質テンプレート',
    price: 0,
    icon: Crown,
    templates: [
      {
        id: 'premium_1',
        content: 'プレミアムテンプレート1: 高度な文脈理解を活用した自然な会話',
        category: 'premium_pack',
        isPreview: true
      },
      {
        id: 'premium_2',
        content: 'プレミアムテンプレート2: 相手の興味に合わせた最適化されたメッセージ',
        category: 'premium_pack',
      },
      {
        id: 'premium_3',
        content: 'プレミアムテンプレート3: 関係性の段階に応じた適切なアプローチ',
        category: 'premium_pack',
      }
    ]
  }
]; 