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
// 2025-07-28: LINE移行テンプレートを削除し、3つのテンプレートのみに整理
export const templateCategories: TemplateCategory[] = [
  {
    id: 'first_message_pack',
    name: '初回メッセージ',
    description: 'Tinder・タップル用の返信率が高い初回メッセージ30種類',
    price: 2500,
    priceId: 'price_1Rl6WZQoDVsMq3SibYnakW14',
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
      },
      {
        id: 'first_6',
        content: 'プロフィール見させていただきました！[具体的な写真や内容]がとても印象的で、お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_7',
        content: 'こんにちは！[共通の関心事]について、とても興味があります。お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_8',
        content: 'はじめまして！[具体的な体験や趣味]について、とても興味深いです。お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_9',
        content: 'プロフィール拝見しました！[具体的な印象]で、とても魅力的だなと思いました。よろしければ、お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_10',
        content: 'こんにちは！[共通の関心事]について、とても興味があります。お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_11',
        content: 'はじめまして！[具体的な体験や趣味]について、とても興味深いです。お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_12',
        content: 'プロフィール見させていただきました！[具体的な写真や内容]がとても印象的で、お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_13',
        content: 'こんにちは！[共通の関心事]について、とても興味があります。お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_14',
        content: 'はじめまして！[具体的な体験や趣味]について、とても興味深いです。お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_15',
        content: 'プロフィール拝見しました！[具体的な印象]で、とても魅力的だなと思いました。よろしければ、お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_16',
        content: 'こんにちは！[共通の関心事]について、とても興味があります。お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_17',
        content: 'はじめまして！[具体的な体験や趣味]について、とても興味深いです。お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_18',
        content: 'プロフィール見させていただきました！[具体的な写真や内容]がとても印象的で、お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_19',
        content: 'こんにちは！[共通の関心事]について、とても興味があります。お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_20',
        content: 'はじめまして！[具体的な体験や趣味]について、とても興味深いです。お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_21',
        content: 'プロフィール拝見しました！[具体的な印象]で、とても魅力的だなと思いました。よろしければ、お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_22',
        content: 'こんにちは！[共通の関心事]について、とても興味があります。お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_23',
        content: 'はじめまして！[具体的な体験や趣味]について、とても興味深いです。お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_24',
        content: 'プロフィール見させていただきました！[具体的な写真や内容]がとても印象的で、お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_25',
        content: 'こんにちは！[共通の関心事]について、とても興味があります。お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_26',
        content: 'はじめまして！[具体的な体験や趣味]について、とても興味深いです。お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_27',
        content: 'プロフィール拝見しました！[具体的な印象]で、とても魅力的だなと思いました。よろしければ、お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_28',
        content: 'こんにちは！[共通の関心事]について、とても興味があります。お話しさせていただけませんか？',
        category: 'first_message_pack',
      },
      {
        id: 'first_29',
        content: 'はじめまして！[具体的な体験や趣味]について、とても興味深いです。お話しできればと思います。',
        category: 'first_message_pack',
      },
      {
        id: 'first_30',
        content: 'プロフィール見させていただきました！[具体的な写真や内容]がとても印象的で、お話しできればと思います。',
        category: 'first_message_pack',
      }
    ]
  },
  {
    id: 'date_invitation_pack',
    name: 'デート誘い',
    description: '自然で断られにくいデート誘いメッセージ30種類',
    price: 2500,
    priceId: 'price_1Roiu5QoDVsMq3SiYXbdh2xT',
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
        content: '今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_4',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_5',
        content: 'もしよろしければ、今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_6',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_7',
        content: '今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_8',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_9',
        content: 'もしよろしければ、今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_10',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_11',
        content: '今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_12',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_13',
        content: 'もしよろしければ、今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_14',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_15',
        content: '今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_16',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_17',
        content: 'もしよろしければ、今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_18',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_19',
        content: '今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_20',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_21',
        content: 'もしよろしければ、今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_22',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_23',
        content: '今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_24',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_25',
        content: 'もしよろしければ、今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_26',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_27',
        content: '今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_28',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_29',
        content: 'もしよろしければ、今度一緒に[場所]に行きませんか？とても素敵な場所で、きっと気に入っていただけると思います。',
        category: 'date_invitation_pack',
      },
      {
        id: 'date_30',
        content: '[場所]でお茶でもいかがでしょうか？雰囲気が良くて、お話しするのにぴったりの場所です。',
        category: 'date_invitation_pack',
      }
    ]
  },
  {
    id: 'conversation_topics_pack',
    name: '会話ネタ',
    description: '会話が続く話題とボケ例30種類',
    price: 2500,
    priceId: 'price_1Roiu5QoDVsMq3SiYXbdh2xT',
    icon: Star,
    templates: [
      {
        id: 'conversation_1',
        content: '最近何か面白いことがありましたか？僕は[具体的な体験]があって、とても楽しかったです。',
        category: 'conversation_topics_pack',
        isPreview: true
      },
      {
        id: 'conversation_2',
        content: '[趣味]について詳しく教えてください！とても興味があります。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_3',
        content: '最近見た映画やドラマで印象に残ったものはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_4',
        content: '[場所]に行ったことがありますか？とても素敵な場所だと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_5',
        content: '最近何か新しいことに挑戦しましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_6',
        content: '[食べ物]は好きですか？僕も大好きです。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_7',
        content: '最近読んだ本で印象に残ったものはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_8',
        content: '[音楽]は好きですか？とても良い曲だと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_9',
        content: '最近何か楽しいことがありましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_10',
        content: '[スポーツ]は好きですか？とても楽しいスポーツだと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_11',
        content: '最近何か新しい発見がありましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_12',
        content: '[アート]は好きですか？とても美しいと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_13',
        content: '最近何か感動したことがありましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_14',
        content: '[旅行]は好きですか？とても楽しい体験だと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_15',
        content: '最近何か新しいことに気づきましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_16',
        content: '[料理]は好きですか？とても美味しそうだと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_17',
        content: '最近何か新しい発見がありましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_18',
        content: '[ファッション]は好きですか？とても素敵だと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_19',
        content: '最近何か楽しいことがありましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_20',
        content: '[ゲーム]は好きですか？とても楽しいゲームだと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_21',
        content: '最近何か新しいことに挑戦しましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_22',
        content: '[写真]は好きですか？とても美しい写真だと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_23',
        content: '最近何か感動したことがありましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_24',
        content: '[ダンス]は好きですか？とても楽しいダンスだと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_25',
        content: '最近何か新しい発見がありましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_26',
        content: '[ヨガ]は好きですか？とても健康的な運動だと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_27',
        content: '最近何か楽しいことがありましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_28',
        content: '[ランニング]は好きですか？とても健康的な運動だと思います。',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_29',
        content: '最近何か新しいことに気づきましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'conversation_30',
        content: '[瞑想]は好きですか？とてもリラックスできると思います。',
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