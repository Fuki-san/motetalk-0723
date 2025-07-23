import React, { useState, useEffect } from 'react';
import { User, Crown, CreditCard, Settings, Bell, Shield, Download, Trash2, Star, Check } from 'lucide-react';
import { purchaseSubscription, cancelSubscription, subscriptionPlans, templatePacks } from '../services/stripeService';
import { useUserData } from '../hooks/useUserData';
import { useAuth } from '../hooks/useAuth';
import { useUserSettings } from '../hooks/useUserSettings';
import { getAuth } from 'firebase/auth';

interface MyPageProps {
  user: { name: string; email: string } | null;
}

const MyPage: React.FC<MyPageProps> = ({ user }) => {
  const { user: authUser, signOut } = useAuth();
  const { userProfile, loading: userDataLoading } = useUserData();
  const { settings, loading: settingsLoading, saving: settingsSaving, updateNotificationSetting, updatePrivacySetting } = useUserSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // 購入履歴を取得
  const [purchaseHistory, setPurchaseHistory] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      // Firebaseの現在のユーザーを直接取得
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      setHistoryLoading(true);
      try {
        const response = await fetch('/api/purchase-history', {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPurchaseHistory(data);
        }
      } catch (error) {
        console.error('Failed to fetch purchase history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [authUser]);

  if (userDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const userData = {
    name: user?.name || userProfile?.name || 'ユーザー',
    email: user?.email || userProfile?.email || '',
    plan: userProfile?.plan === 'premium' ? 'プレミアム' : '無料',
    subscriptionStatus: userProfile?.subscriptionStatus,
    purchasedTemplates: userProfile?.purchasedTemplates || []
  };

  // テンプレートパック情報を取得
  const getPurchasedTemplateInfo = (templateId: string) => {
    const pack = templatePacks.find(p => p.id === templateId);
    const purchase = purchaseHistory?.purchases?.find((p: any) => p.templateId === templateId);
    
    return pack ? {
      id: templateId,
      name: pack.name,
      price: pack.price,
      purchaseDate: purchase?.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString('ja-JP') : '購入日不明'
    } : null;
  };

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    try {
      await purchaseSubscription(planId);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('サブスクリプションの処理中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('本当にサブスクリプションを解約しますか？')) {
      return;
    }

    setIsLoading(true);
    try {
      await cancelSubscription();
      alert('サブスクリプションの解約処理を開始しました。');
      // ページをリロードして最新状態を取得
      window.location.reload();
    } catch (error) {
      console.error('Cancellation error:', error);
      alert('解約処理中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // 確認ダイアログ（2段階確認）
    const firstConfirm = confirm(
      'アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。\n\n本当にアカウントを削除しますか？'
    );
    
    if (!firstConfirm) return;
    
    const secondConfirm = confirm(
      '最終確認です。\n\n・すべての会話履歴が削除されます\n・購入済みテンプレートも利用できなくなります\n・サブスクリプションも自動的に解約されます\n\nこの操作は取り消すことができません。本当に削除しますか？'
    );
    
    if (!secondConfirm) return;

    setIsDeleting(true);
    try {
      // 認証トークンを取得
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('ユーザーが認証されていません');
      }
      
      const token = await currentUser.getIdToken();
      if (!token) {
        throw new Error('認証トークンが取得できません');
      }

      // アカウント削除API呼び出し
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`アカウント削除に失敗しました (${response.status})`);
      }

      const result = await response.json();
      console.log('✅ Account deletion result:', result);
      
      if (result.success) {
        alert('アカウントが正常に削除されました。ご利用いただき、ありがとうございました。');
        
        // Firebase認証からもサインアウト
        await signOut();
        
        // トップページにリダイレクト
        window.location.href = '/';
      } else {
        throw new Error(result.message || 'アカウント削除に失敗しました');
      }

    } catch (error) {
      console.error('Account deletion error:', error);
      alert(`アカウント削除中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'プロフィール', icon: User },
    { id: 'subscription', name: 'サブスクリプション', icon: Crown },
    { id: 'purchases', name: '購入履歴', icon: CreditCard },
    { id: 'settings', name: '設定', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">基本情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                  <input
                    type="text"
                    value={userData.name}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                  <input
                    type="email"
                    value={userData.email}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            {userData.plan === 'プレミアム' ? (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">現在のプラン</h3>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Crown className="w-8 h-8 text-purple-600" />
                    <div>
                      <div className="font-semibold text-gray-800">{userData.plan}</div>
                      <div className="text-sm text-gray-600">
                        ステータス: {userData.subscriptionStatus === 'active' ? 'アクティブ' : '不明'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">¥1,980</div>
                    <div className="text-sm text-gray-600">/月</div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button 
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                    className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? '処理中...' : '解約する'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">現在のプラン</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-8 h-8 text-gray-600" />
                    <div>
                      <div className="font-semibold text-gray-800">無料プラン</div>
                      <div className="text-sm text-gray-600">基本機能をご利用いただけます</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-600">¥0</div>
                    <div className="text-sm text-gray-600">/月</div>
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => handleSubscribe('premium_monthly')}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200"
                  >
                    {isLoading ? '処理中...' : 'プレミアムにアップグレード'}
                  </button>
                </div>
              </div>
            )}

            {userData.plan === 'プレミアム' && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">支払い方法</h3>
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">Stripe決済</div>
                    <div className="text-sm text-gray-600">決済情報はStripeで管理されています</div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 text-sm">
                    変更
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'purchases':
        return (
          <div className="space-y-6">
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">購入履歴を読み込み中...</p>
              </div>
            ) : (
              <>
                {/* サブスクリプション履歴 */}
                {purchaseHistory?.subscriptions && purchaseHistory.subscriptions.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Crown className="w-5 h-5 mr-2" />
                      サブスクリプション履歴
                    </h3>
                    {purchaseHistory.subscriptions.map((sub: any) => (
                      <div key={sub.id} className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">プレミアムプラン</h4>
                            <p className="text-sm text-gray-600">月額 ¥{sub.amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">
                              {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('ja-JP') : '購入日不明'}
                            </p>
                          </div>
                          <Crown className="w-5 h-5 text-yellow-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* テンプレート購入履歴 */}
                {purchaseHistory?.purchases && purchaseHistory.purchases.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Download className="w-5 h-5 mr-2" />
                      テンプレート購入履歴
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {purchaseHistory.purchases.map((purchase: any) => (
                        <div key={purchase.id} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800">{purchase.templateName}</h4>
                              <p className="text-sm text-gray-600">¥{purchase.amount.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">
                                {purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString('ja-JP') : '購入日不明'}
                              </p>
                            </div>
                            <Check className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 購入履歴がない場合 */}
                {(!purchaseHistory?.subscriptions || purchaseHistory.subscriptions.length === 0) && 
                 (!purchaseHistory?.purchases || purchaseHistory.purchases.length === 0) && (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">購入履歴がありません</p>
                    <p className="text-sm text-gray-400 mt-2">テンプレートパックやプレミアムプランをご購入いただくと、ここに表示されます。</p>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">通知設定</h3>
              {settingsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-800">メール通知</div>
                      <div className="text-sm text-gray-600">新機能やお得な情報をお知らせ</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.notifications.email}
                      onChange={(e) => updateNotificationSetting('email', e.target.checked)}
                      disabled={settingsSaving}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-800">プッシュ通知</div>
                      <div className="text-sm text-gray-600">アプリからの通知</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.notifications.push}
                      onChange={(e) => updateNotificationSetting('push', e.target.checked)}
                      disabled={settingsSaving}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
              )}
              {settingsSaving && (
                <div className="mt-4 text-sm text-purple-600 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span>設定を保存中...</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">プライバシー</h3>
              {settingsLoading ? (
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-800">会話履歴の保存</div>
                      <div className="text-sm text-gray-600">AIの改善のため匿名化して利用</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.privacy.saveConversationHistory}
                      onChange={(e) => updatePrivacySetting('saveConversationHistory', e.target.checked)}
                      disabled={settingsSaving}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
              )}
              
              {!settings.privacy.saveConversationHistory && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      会話履歴を保存しない場合、AIの返信品質が低下する可能性があります
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">アカウント</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full flex items-center justify-center space-x-2 bg-red-100 text-red-700 py-3 px-4 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? '削除中...' : 'アカウントを削除'}</span>
                </button>
              </div>
              
              {/* アカウント削除の注意事項 */}
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Trash2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">アカウント削除について</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>すべてのデータが完全に削除されます</li>
                      <li>購入済みテンプレートも利用できなくなります</li>
                      <li>この操作は取り消すことができません</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            マイページ
          </h1>
          <p className="text-gray-600">
            アカウント情報と設定を管理
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;