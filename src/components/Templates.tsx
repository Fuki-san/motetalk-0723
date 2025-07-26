import React, { useState, useEffect } from 'react';
import { Copy, Lock, ShoppingBag, Check } from 'lucide-react';
import { purchaseTemplate, checkTemplatePurchaseStatus } from '../services/stripeService';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { templateCategories, Template, TemplateCategory } from '../data/templateData';

const Templates = () => {
  const { user } = useAuth();
  const { userProfile } = useUserData();
  const [selectedCategory, setSelectedCategory] = useState('first_message_pack');
  const [viewMode, setViewMode] = useState<'shop' | 'purchased'>('shop');
  const [copiedTemplateId, setCopiedTemplateId] = useState<string>('');
  const [purchasedTemplates, setPurchasedTemplates] = useState<string[]>([]);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [loading, setLoading] = useState(true);

  // URLパラメータからviewモードを設定
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam === 'purchased') {
      setViewMode('purchased');
    }
  }, []);

  // 購入済みテンプレートの状態を動的に取得
  useEffect(() => {
    const loadTemplatePurchaseStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const status = await checkTemplatePurchaseStatus();
        console.log('🔄 APIレスポンス:', status);
        // null値を除外して購入済みテンプレートを設定
        const validPurchasedTemplates = (status.purchasedTemplates || []).filter((id: string | null) => id !== null);
        setPurchasedTemplates(validPurchasedTemplates);
        setIsPremiumUser(status.isPremiumUser || false);
        console.log('✅ テンプレート購入状況取得成功:', {
          purchasedTemplates: status.purchasedTemplates || [],
          purchasedTemplatesCount: status.purchasedTemplates?.length || 0,
          isPremiumUser: status.isPremiumUser,
          plan: status.plan
        });
      } catch (error) {
        console.error('テンプレート購入状況の取得に失敗:', error);
        // フォールバック: userProfileから取得
        setPurchasedTemplates(userProfile?.purchasedTemplates || []);
        setIsPremiumUser(userProfile?.plan === 'premium');
        console.log('⚠️ フォールバック: userProfileから取得:', {
          purchasedTemplates: userProfile?.purchasedTemplates || [],
          purchasedTemplatesCount: userProfile?.purchasedTemplates?.length || 0,
          plan: userProfile?.plan
        });
      } finally {
        setLoading(false);
      }
    };

    loadTemplatePurchaseStatus();
  }, [user, userProfile]);

  // ページフォーカス時の重複処理を削除（2回読み込みの原因）
  // useEffect(() => {
  //   const handleFocus = () => {
  //     if (user) {
  //       loadTemplatePurchaseStatus();
  //     }
  //   };

  //   window.addEventListener('focus', handleFocus);
  //   return () => window.removeEventListener('focus', handleFocus);
  // }, [user]);

  // 購入状況を更新する関数（削除せずに残す）
  const loadTemplatePurchaseStatus = async () => {
    if (!user) return;

    try {
      const status = await checkTemplatePurchaseStatus();
      setPurchasedTemplates(status.purchasedTemplates || []);
      setIsPremiumUser(status.isPremiumUser || false);
      console.log('🔄 テンプレート購入状況を更新:', {
        purchasedTemplates: status.purchasedTemplates?.length || 0,
        isPremiumUser: status.isPremiumUser
      });
    } catch (error) {
      console.error('テンプレート購入状況の更新に失敗:', error);
    }
  };

  // テンプレート購入処理
  const handlePurchase = async (categoryId: string) => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    try {
      await purchaseTemplate(categoryId);
      // 購入後に購入状況を再取得
      await loadTemplatePurchaseStatus();
      console.log('✅ テンプレート購入完了、購入状況を更新');
      
      // 購入済みタブに切り替え
      setViewMode('purchased');
      setSelectedCategory(categoryId);
    } catch (error) {
      console.error('テンプレート購入エラー:', error);
      alert('購入処理中にエラーが発生しました');
    }
  };

  // テンプレートコピー処理
  const handleCopyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    setCopiedTemplateId(template.id);
    setTimeout(() => setCopiedTemplateId(''), 2000);
  };

  // 表示するテンプレートを取得
  const getDisplayTemplates = () => {
    console.log('🔍 テンプレート表示ロジック:', {
      viewMode,
      purchasedTemplates,
      purchasedTemplatesLength: purchasedTemplates.length,
      isPremiumUser,
      userProfile: userProfile?.plan,
      templateCategories: templateCategories.map(cat => ({ id: cat.id, name: cat.name }))
    });

    if (viewMode === 'purchased') {
      // 購入済みモード: 実際に購入したテンプレートのみ表示（サブスク会員も無料会員も同じ）
      const purchasedCategories = templateCategories.filter(category => 
        purchasedTemplates.includes(category.id)
      );
      console.log('📦 購入済みテンプレート:', purchasedCategories.map(cat => ({ id: cat.id, name: cat.name })));
      console.log('📦 購入済みテンプレート数:', purchasedCategories.length);
      return purchasedCategories;
    }
    
    // ショップモード: 未購入のテンプレートを表示（サブスク会員も無料会員も同じ）
    const availableCategories = templateCategories.filter(category => {
      const isPurchased = purchasedTemplates.includes(category.id);
      return !isPurchased;
    });
    
    console.log('🛒 購入可能テンプレート:', availableCategories.map(cat => ({ id: cat.id, name: cat.name })));
    console.log('🔒 購入済みテンプレート（Shopから除外）:', purchasedTemplates);
    return availableCategories;
  };

  const displayCategories = getDisplayTemplates();
  
  // 購入済みモードで選択されたカテゴリが購入済みでない場合は選択をクリア
  if (viewMode === 'purchased' && selectedCategory && !purchasedTemplates.includes(selectedCategory)) {
    setSelectedCategory('');
  }
  
  const selectedCategoryData = templateCategories.find(cat => cat.id === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            テンプレート
          </h1>
          <p className="text-gray-600">
            マッチングアプリ専用の高品質テンプレート
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('shop')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'shop'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                ショップ
              </button>
              <button
                onClick={() => setViewMode('purchased')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'purchased'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                購入済み
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">カテゴリ</h3>
              {displayCategories.length > 0 ? (
                <nav className="space-y-2">
                  {displayCategories.map((category) => {
                    const Icon = category.icon;
                    const isPurchased = purchasedTemplates.includes(category.id);
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs opacity-75">
                            {isPurchased ? '購入済み' : `¥${category.price.toLocaleString()}`}
                          </div>
                        </div>
                        {isPurchased && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <ShoppingBag className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 text-sm">
                    {viewMode === 'purchased' 
                      ? '購入済みのテンプレートがありません'
                      : '利用可能なテンプレートがありません'
                    }
                  </p>
                  {viewMode === 'purchased' && (
                    <button
                      onClick={() => setViewMode('shop')}
                      className="mt-4 text-purple-600 hover:text-purple-700 text-sm"
                    >
                      ショップを見る
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {selectedCategoryData ? (
              <div className="space-y-6">
                {/* Category Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <selectedCategoryData.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedCategoryData.name}</h2>
                        <p className="text-gray-600">{selectedCategoryData.description}</p>
                      </div>
                    </div>
                    {viewMode === 'shop' && !purchasedTemplates.includes(selectedCategoryData.id) && (
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600">¥{selectedCategoryData.price.toLocaleString()}</div>
                        <button
                          data-testid="purchase-button"
                          onClick={() => handlePurchase(selectedCategoryData.id)}
                          className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                        >
                          購入する
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Templates Display */}
                {viewMode === 'purchased' && purchasedTemplates.includes(selectedCategoryData.id) ? (
                  // 購入済みモード: 購入済みテンプレートの全内容を表示
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Check className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-800">購入済みテンプレート</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedCategoryData.templates.map((template, index) => (
                        <div key={template.id} className="flex items-start space-x-3">
                          <span className="text-purple-600 font-medium mt-1">{index + 1}.</span>
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed">{template.content}</p>
                            <button
                              onClick={() => handleCopyTemplate(template)}
                              className="mt-2 flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors text-sm"
                            >
                              <Copy className="w-4 h-4" />
                              <span>{copiedTemplateId === template.id ? 'コピーしました！' : 'コピー'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : viewMode === 'shop' ? (
                  // ショップモード: 未購入テンプレートは1文だけプレビュー、全内容・コピー不可
                  <div className="grid grid-cols-1 gap-6">
                    {selectedCategoryData.templates.slice(0, 1).map((template) => (
                      <div key={template.id} className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Lock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {purchasedTemplates.includes(selectedCategoryData.id) 
                                  ? 'プレビュー（購入済み - 購入済みページで全内容を確認）' 
                                  : 'プレビュー（購入で全30種解放）'
                                }
                              </span>
                            </div>
                            <p className="text-gray-800 leading-relaxed">
                              {template.content.substring(0, 40)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Lock className="w-4 h-4" />
                            <span>
                              {purchasedTemplates.includes(selectedCategoryData.id)
                                ? '購入済み - 購入済みページで全テンプレートを確認'
                                : '購入後に全30種のテンプレートが利用可能'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // 購入済みモードで未購入テンプレートが選択された場合
                  <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <Lock className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">このテンプレートは購入していません</h3>
                    <p className="text-gray-600 mb-4">ショップで購入してからご利用ください</p>
                    <button
                      onClick={() => setViewMode('shop')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                    >
                      ショップを見る
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">テンプレートが見つかりません</h3>
                <p className="text-gray-600">選択されたカテゴリのテンプレートがありません。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;