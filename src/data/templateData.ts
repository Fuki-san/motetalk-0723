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
      },
      {
        id: 'line_4',
        content: '楽しいお話でした！LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_5',
        content: 'お話しできて良かったです。LINEでも続きを聞かせてください！ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_6',
        content: 'とても興味深いお話でした。LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_7',
        content: 'お話しできて楽しかったです！LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_8',
        content: 'とても興味深いお話でした。LINEでも続きを聞かせてください！ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_9',
        content: 'お話しできて嬉しかったです。LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_10',
        content: '楽しいお話でした！LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_11',
        content: 'お話しできて良かったです。LINEでも続きを聞かせてください！ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_12',
        content: 'とても興味深いお話でした。LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_13',
        content: 'お話しできて楽しかったです！LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_14',
        content: 'とても興味深いお話でした。LINEでも続きを聞かせてください！ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_15',
        content: 'お話しできて嬉しかったです。LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_16',
        content: '楽しいお話でした！LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_17',
        content: 'お話しできて良かったです。LINEでも続きを聞かせてください！ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_18',
        content: 'とても興味深いお話でした。LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_19',
        content: 'お話しできて楽しかったです！LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_20',
        content: 'とても興味深いお話でした。LINEでも続きを聞かせてください！ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_21',
        content: 'お話しできて嬉しかったです。LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_22',
        content: '楽しいお話でした！LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_23',
        content: 'お話しできて良かったです。LINEでも続きを聞かせてください！ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_24',
        content: 'とても興味深いお話でした。LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_25',
        content: 'お話しできて楽しかったです！LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_26',
        content: 'とても興味深いお話でした。LINEでも続きを聞かせてください！ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_27',
        content: 'お話しできて嬉しかったです。LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_28',
        content: '楽しいお話でした！LINEでも続きを聞かせてください。ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_29',
        content: 'お話しできて良かったです。LINEでも続きを聞かせてください！ID: [LINE_ID]',
        category: 'line_transition_pack',
      },
      {
        id: 'line_30',
        content: 'とても興味深いお話でした。LINEでも続きを聞かせてください。ID: [LINE_ID]',
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
    description: '会話が続く話題と質問30種類',
    price: 980,
    icon: Star,
    templates: [
      {
        id: 'topic_1',
        content: '最近何か新しいことに挑戦されましたか？',
        category: 'conversation_topics_pack',
        isPreview: true
      },
      {
        id: 'topic_2',
        content: '休日はどんなことをして過ごされることが多いですか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_3',
        content: 'お気に入りの映画やドラマはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_4',
        content: '最近読んだ本で印象に残っているものはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_5',
        content: '旅行で行ってみたい場所はありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_6',
        content: 'お気に入りの食べ物や料理はありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_7',
        content: '最近何か新しいことに挑戦されましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_8',
        content: '休日はどんなことをして過ごされることが多いですか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_9',
        content: 'お気に入りの映画やドラマはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_10',
        content: '最近読んだ本で印象に残っているものはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_11',
        content: '旅行で行ってみたい場所はありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_12',
        content: 'お気に入りの食べ物や料理はありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_13',
        content: '最近何か新しいことに挑戦されましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_14',
        content: '休日はどんなことをして過ごされることが多いですか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_15',
        content: 'お気に入りの映画やドラマはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_16',
        content: '最近読んだ本で印象に残っているものはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_17',
        content: '旅行で行ってみたい場所はありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_18',
        content: 'お気に入りの食べ物や料理はありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_19',
        content: '最近何か新しいことに挑戦されましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_20',
        content: '休日はどんなことをして過ごされることが多いですか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_21',
        content: 'お気に入りの映画やドラマはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_22',
        content: '最近読んだ本で印象に残っているものはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_23',
        content: '旅行で行ってみたい場所はありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_24',
        content: 'お気に入りの食べ物や料理はありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_25',
        content: '最近何か新しいことに挑戦されましたか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_26',
        content: '休日はどんなことをして過ごされることが多いですか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_27',
        content: 'お気に入りの映画やドラマはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_28',
        content: '最近読んだ本で印象に残っているものはありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_29',
        content: '旅行で行ってみたい場所はありますか？',
        category: 'conversation_topics_pack',
      },
      {
        id: 'topic_30',
        content: 'お気に入りの食べ物や料理はありますか？',
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