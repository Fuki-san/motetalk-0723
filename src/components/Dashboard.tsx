import React, { useState, useEffect } from 'react';
import { Send, Copy, RefreshCw, Sparkles, MessageCircle, Crown, Star, ArrowRight, Trash2, RotateCcw, Settings, AlertTriangle, Plus, History, Save, FolderOpen } from 'lucide-react';
import { generateReplies, ConversationTurn as ApiConversationTurn } from '../services/geminiService';
import { checkUsageLimit, incrementUsage, getUsageDisplayText, getUsageWarningMessage, UsageLimit } from '../services/usageService';
import { saveConversation, getConversationList, getConversation, deleteConversation, ConversationHistory, ConversationTurn as HistoryConversationTurn } from '../services/conversationService';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { trackAIGeneration, trackBackgroundContextChange, trackPageView } from '../config/analytics';

interface DashboardProps {
  isAuthenticated: boolean;
}

interface ConversationTurn {
  id: string;
  userMessage: string;
  aiReplies: string[];
  selectedReply: string;
  timestamp: Date;
}

const Dashboard: React.FC<DashboardProps> = ({ isAuthenticated }) => {
  const { user: authUser } = useAuth();
  const { userProfile, refreshUserData } = useUserData();
  const [inputMessage, setInputMessage] = useState('');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [currentReplies, setCurrentReplies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReplyIndex, setSelectedReplyIndex] = useState<number | null>(null);
  const [editableReply, setEditableReply] = useState('');

  const [userSettings, setUserSettings] = useState({
    backgroundContext: ''
  });
  const [usageLimit, setUsageLimit] = useState<UsageLimit | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // 使用回数制限をチェック
  useEffect(() => {
    const loadUsageLimit = async () => {
      if (isAuthenticated && authUser) {
        try {
          setUsageLoading(true);
          const limit = await checkUsageLimit();
          setUsageLimit(limit);
        } catch (error) {
          setUsageLimit({
            canUse: true,
            remainingUses: 3,
            totalUses: 3,
            plan: 'free'
          });
        } finally {
          setUsageLoading(false);
        }
      } else {
        setUsageLimit(null);
        setUsageLoading(false);
      }
    };
    loadUsageLimit();
  }, [isAuthenticated, authUser]);

  // ページがフォーカスされた時に使用回数とユーザー情報を再取得
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && authUser) {
        loadUsageLimit();
        refreshUserData(); // 購入後の状態更新のため
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, authUser, refreshUserData]);

  // ページビューのトラッキング
  useEffect(() => {
    trackPageView('AI返信作成');
  }, []);

  // ユーザープロフィールが更新された時に使用回数も再取得
  useEffect(() => {
    if (userProfile && isAuthenticated && authUser) {
      loadUsageLimit();
    }
  }, [userProfile, isAuthenticated, authUser]);

  const loadUsageLimit = async () => {
    if (isAuthenticated && authUser) {
      try {
        setUsageLoading(true);
        const limit = await checkUsageLimit();
        setUsageLimit(limit);
      } catch (error) {
        console.error('❌ Failed to load usage limit:', error);
        setUsageLimit({
          canUse: true,
          remainingUses: 3,
          totalUses: 3,
          plan: 'free'
        });
      } finally {
        setUsageLoading(false);
      }
    } else {
      setUsageLimit(null);
      setUsageLoading(false);
    }
  };

  const handleGenerateReplies = async () => {
    if (!inputMessage.trim()) return;
    
    // プレミアムユーザーは使用回数制限をチェックしない
    if (usageLimit && usageLimit.plan === 'free' && !usageLimit.canUse) {
      alert('今月の使用回数上限に達しました。プレミアムプランにアップグレードしてください。');
      return;
    }
    
    setIsLoading(true);
    setSelectedReplyIndex(null);
    try {
      // 無料ユーザーのみ使用回数を増加
      if (usageLimit && usageLimit.plan === 'free') {
        try {
          // 使用回数を増加
          await incrementUsage();
          
          // サーバーから最新の使用回数を取得
          const updatedLimit = await checkUsageLimit();
          setUsageLimit(updatedLimit);
          
          // 使用回数が0になった場合は処理を停止
          if (!updatedLimit.canUse) {
            alert('今月の使用回数上限に達しました。プレミアムプランにアップグレードしてください。');
            setIsLoading(false);
            return;
          }
        } catch (usageError) {
          console.error('❌ Usage increment failed:', usageError);
          alert('使用回数の更新に失敗しました。もう一度お試しください。');
          setIsLoading(false);
          return;
        }
      }
      const apiConversationHistory: ApiConversationTurn[] = conversation.map(turn => ({
        userMessage: turn.userMessage,
        selectedReply: turn.selectedReply
      }));
      const response = await generateReplies({
        currentMessage: inputMessage,
        conversationHistory: apiConversationHistory,
        userProfile: {
          backgroundContext: userSettings.backgroundContext || undefined
        }
      });
      if (response.success) {
        setCurrentReplies(response.replies);
        // AI返信生成イベントをトラッキング
        trackAIGeneration();
      } else {
        setCurrentReplies(response.replies);
      }
    } catch (error) {
      setCurrentReplies([
        'そのお話、とても興味深いです！詳しく聞かせてください。',
        'なるほど！僕も似たような経験があって、共感できます。',
        '面白いですね。今度詳しくお聞かせいただけると嬉しいです。'
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectReply = (index: number) => {
    setSelectedReplyIndex(index);
    setEditableReply(currentReplies[index]);
  };

  const handleSendReply = () => {
    if (selectedReplyIndex === null || !editableReply.trim()) return;
    const newTurn: ConversationTurn = {
      id: Date.now().toString(),
      userMessage: inputMessage,
      aiReplies: currentReplies,
      selectedReply: editableReply,
      timestamp: new Date()
    };
    const updatedConversation = [...conversation, newTurn];
    setConversation(updatedConversation);
    setInputMessage('');
    setCurrentReplies([]);
    setSelectedReplyIndex(null);
    setEditableReply('');
  };

  const handleCopyReply = (reply: string) => {
    navigator.clipboard.writeText(reply);
  };

  const handleClearConversation = () => {
    setConversation([]);
    setCurrentReplies([]);
    setInputMessage('');
    setSelectedReplyIndex(null);
    setEditableReply('');
  };

  // 会話履歴一覧を取得
  const loadConversationHistory = async () => {
    if (!isAuthenticated || !authUser) return;
    
    try {
      setHistoryLoading(true);
      const history = await getConversationList();
      setConversationHistory(history);
    } catch (error) {
      console.error('会話履歴の取得に失敗しました:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 会話履歴を開く
  const handleLoadConversation = async (conversationId: string) => {
    try {
      const conversation = await getConversation(conversationId);
      if (conversation) {
        setConversation(conversation.turns);
        setCurrentReplies([]);
        setInputMessage('');
        setSelectedReplyIndex(null);
        setEditableReply('');
        setShowHistoryModal(false);
      }
    } catch (error) {
      console.error('会話履歴の読み込みに失敗しました:', error);
    }
  };

  // 会話履歴を削除
  const handleDeleteConversation = async (conversationId: string) => {
    if (confirm('この会話履歴を削除しますか？')) {
      try {
        await deleteConversation(conversationId);
        await loadConversationHistory(); // 一覧を再取得
      } catch (error) {
        console.error('会話履歴の削除に失敗しました:', error);
      }
    }
  };

  // 会話を保存
  const handleSaveConversation = async () => {
    if (!saveTitle.trim() || conversation.length === 0) return;
    
    try {
      setSaveLoading(true);
      
      // プレミアムユーザーの場合、会話履歴の数をチェック
      if (usageLimit && usageLimit.isPremium) {
        const currentHistory = await loadConversationHistory();
        if (currentHistory && currentHistory.length >= 3) {
          if (confirm('会話履歴が最大数（3つ）に達しています。古い会話履歴を削除して新しい会話を保存しますか？')) {
            // 最も古い会話履歴を削除
            const oldestConversation = currentHistory[currentHistory.length - 1];
            if (oldestConversation) {
              await deleteConversation(oldestConversation.id);
            }
          } else {
            setSaveLoading(false);
            return;
          }
        }
      }
      
      const success = await saveConversation(saveTitle, conversation);
      if (success) {
        setShowSaveModal(false);
        setSaveTitle('');
        alert('会話を保存しました！');
      } else {
        alert('会話の保存に失敗しました。');
      }
    } catch (error) {
      console.error('会話の保存に失敗しました:', error);
      alert('会話の保存に失敗しました。');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditAndRegenerate = (turnId: string) => {
    const turn = conversation.find(t => t.id === turnId);
    if (turn) {
      setInputMessage(turn.userMessage);
      const turnIndex = conversation.findIndex(t => t.id === turnId);
      setConversation(conversation.slice(0, turnIndex));
      setCurrentReplies([]);
      setSelectedReplyIndex(null);
      setEditableReply('');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI会話アシスタント</h1>
          <p className="text-gray-600">連続対話で自然な会話の流れをサポート</p>
          
          {/* プレミアムユーザー向け機能ボタン */}
          {usageLimit && usageLimit.isPremium && (
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg">
                <Crown className="w-4 h-4" />
                <span>プレミアムプラン</span>
              </div>
              <button
                onClick={() => {
                  loadConversationHistory();
                  setShowHistoryModal(true);
                }}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>会話履歴</span>
              </button>
              <button
                onClick={() => {
                  setConversation([]);
                  setCurrentReplies([]);
                  setSelectedReplyIndex(null);
                  setEditableReply('');
                  setInputMessage('');
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>新しいチャット</span>
              </button>
              {conversation.length > 0 && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>会話を保存</span>
                </button>
              )}
            </div>
          )}
        </div>
        {usageLimit && !usageLoading && (
          <div className={`border rounded-lg p-4 mb-6 ${
            usageLimit.isPremium 
              ? 'bg-purple-50 border-purple-200' 
              : usageLimit.remainingUses === 0
              ? 'bg-red-50 border-red-200'
              : usageLimit.remainingUses <= 1
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {usageLimit.isPremium ? (
                  <Crown className="w-5 h-5 text-purple-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                )}
                <span className={`text-sm ${
                  usageLimit.isPremium 
                    ? 'text-purple-800' 
                    : usageLimit.remainingUses === 0
                    ? 'text-red-800'
                    : usageLimit.remainingUses <= 1
                    ? 'text-yellow-800'
                    : 'text-blue-800'
                }`}>
                  {getUsageDisplayText(usageLimit)}
                </span>
              </div>
              {!usageLimit.isPremium && usageLimit.remainingUses === 0 && (
                <button
                  onClick={async () => {
                    try {
                      const { purchaseSubscription } = await import('../services/stripeService');
                      await purchaseSubscription('premium_monthly');
                    } catch (error) {
                      console.error('Subscription purchase error:', error);
                      alert('アップグレードの処理中にエラーが発生しました。');
                    }
                  }}
                  className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  <Crown className="w-4 h-4" />
                  <span>アップグレード</span>
                </button>
              )}
            </div>
            {getUsageWarningMessage(usageLimit) && (
              <div className="mt-2 text-xs text-yellow-700">
                {getUsageWarningMessage(usageLimit)}
              </div>
            )}
          </div>
        )}
        {conversation.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">会話履歴</h2>
            </div>
            <div className="space-y-4">
              {conversation.map((turn, index) => (
                <div key={turn.id} className="border-l-4 border-purple-200 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{index + 1}回目のやり取り</span>
                    <button
                      onClick={() => handleEditAndRegenerate(turn.id)}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >編集・再生成</button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <div className="text-xs text-gray-500 mb-1">相手からのメッセージ:</div>
                    <div className="text-gray-800">{turn.userMessage}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-xs text-purple-600 mb-1">あなたの返信:</div>
                    <div className="text-gray-800">{turn.selectedReply}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {conversation.length === 0 ? '相手からのメッセージ' : '相手からの次のメッセージ'}
            </h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700 mb-3">背景状況設定</h3>
            <div>
              <label className="block text-xs text-gray-600 mb-1">相手の雰囲気・背景状況（任意）</label>
                              <textarea
                  value={userSettings.backgroundContext}
                  onChange={(e) => {
                    setUserSettings({...userSettings, backgroundContext: e.target.value});
                    // 背景状況設定変更イベントをトラッキング
                    trackBackgroundContextChange();
                  }}
                  placeholder="例: 相手はちょっとギャル系の女子でノリがいい。私から「学生？」って聞いたあとの返信だ。"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                />
            </div>
          </div>
          <div className="space-y-4">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                conversation.length === 0 
                  ? "相手から受け取ったメッセージをここに貼り付けてください..."
                  : "相手からの次のメッセージを入力してください..."
              }
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">{inputMessage.length}/500文字</div>
              <button
                onClick={handleGenerateReplies}
                disabled={!inputMessage.trim() || isLoading || (usageLimit ? !usageLimit.canUse : false)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transform transition-all duration-200 ${
                  !inputMessage.trim() || isLoading || (usageLimit ? !usageLimit.canUse : false)
                    ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>
                  {isLoading 
                    ? '生成中...' 
                    : usageLimit && !usageLimit.canUse 
                    ? '使用回数上限' 
                    : '返信を生成'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
        {(currentReplies.length > 0 || isLoading) && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Send className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">提案された返信</h2>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">💡 返信案をタップして選択→編集→送信すると、相手の次のメッセージも入力できて連続対話が可能です</p>
                </div>
                <div className="space-y-4 mb-6">
                  {currentReplies.map((reply, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedReplyIndex === index
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => handleSelectReply(index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                              selectedReplyIndex === index
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-600">返信案 {index + 1}</span>
                            {selectedReplyIndex === index && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">選択中</span>
                            )}
                          </div>
                          <p className="text-gray-800 leading-relaxed">{reply}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyReply(reply);
                          }}
                          className="ml-4 p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedReplyIndex !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Send className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">選択した返信を編集できます</span>
                    </div>
                    <textarea
                      value={editableReply}
                      onChange={(e) => setEditableReply(e.target.value)}
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-4"
                      placeholder="返信内容を編集してください..."
                    />
                    <div className="flex justify-center">
                      <button
                        onClick={handleSendReply}
                        disabled={!editableReply.trim()}
                        className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                      >
                        <Send className="w-4 h-4" />
                        <span>この返信を送信</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {/* 無料ユーザー向けCTA - プレミアムユーザーには表示しない */}
        {usageLimit && usageLimit.plan === 'free' && !usageLimit.isPremium && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-purple-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-800">プレミアムプランでさらに快適に</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <h5 className="font-medium text-gray-800 mb-1">無制限利用</h5>
                  <p className="text-sm text-gray-600">月3回の制限なし</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <History className="w-6 h-6 text-blue-600" />
                  </div>
                  <h5 className="font-medium text-gray-800 mb-1">会話履歴保存</h5>
                  <p className="text-sm text-gray-600">過去の会話を管理</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <h5 className="font-medium text-gray-800 mb-1">全テンプレート</h5>
                  <p className="text-sm text-gray-600">120種類使い放題</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-semibold text-purple-600">今なら月額1,980円</span>で全ての機能が利用可能
                </p>
                <button
                  onClick={async () => {
                    try {
                      const { purchaseSubscription } = await import('../services/stripeService');
                      await purchaseSubscription('premium_monthly');
                    } catch (error) {
                      console.error('Subscription purchase error:', error);
                      alert('アップグレードの処理中にエラーが発生しました。');
                    }
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                >
                  <Crown className="w-4 h-4 inline mr-2" />
                  プレミアムプランにアップグレード
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 会話履歴モーダル */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">会話履歴</h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
              ) : conversationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">保存された会話履歴がありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversationHistory.map((conv) => (
                    <div key={conv.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{conv.title}</h4>
                          <p className="text-sm text-gray-500">
                            {conv.turns.length}回のやり取り • {conv.updatedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLoadConversation(conv.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            開く
                          </button>
                          <button
                            onClick={() => handleDeleteConversation(conv.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 会話保存モーダル */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">会話を保存</h3>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  会話のタイトル
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="例: 初回デートの会話"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveConversation}
                  disabled={!saveTitle.trim() || saveLoading}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>保存</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
