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
        setPurchasedTemplates(status.purchasedTemplates || []);
        setIsPremiumUser(status.isPremiumUser || false);
      } catch (error) {
        console.error('テンプレート購入状況の取得に失敗:', error);
        // フォールバック: userProfileから取得
        setPurchasedTemplates(userProfile?.purchasedTemplates || []);
        setIsPremiumUser(userProfile?.plan === 'premium');
      } finally {
        setLoading(false);
      }
    };

    loadTemplatePurchaseStatus();

    // 購入済みモードの場合、定期的に更新
    if (viewMode === 'purchased') {
      const interval = setInterval(loadTemplatePurchaseStatus, 5000); // 5秒ごとに更新
      return () => clearInterval(interval);
    }
  }, [user, userProfile, viewMode]);

  // テンプレート購入処理
  const handlePurchase = async (categoryId: string) => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    try {
      await purchaseTemplate(categoryId);
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
    if (viewMode === 'purchased') {
      return templateCategories.filter(category => 
        purchasedTemplates.includes(category.id) || 
        (category.id === 'premium_pack' && isPremiumUser)
      );
    }
    return templateCategories.filter(category => 
      category.id !== 'premium_pack' || isPremiumUser
    );
  };

  const displayCategories = getDisplayTemplates();
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
              <nav className="space-y-2">
                {displayCategories.map((category) => {
                  const Icon = category.icon;
                  const isPurchased = purchasedTemplates.includes(category.id);
                  const isPremium = category.id === 'premium_pack' && isPremiumUser;
                  
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
                          {isPurchased || isPremium ? '購入済み' : `¥${category.price.toLocaleString()}`}
                        </div>
                      </div>
                      {(isPurchased || isPremium) && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  );
                })}
              </nav>
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
                          onClick={() => handlePurchase(selectedCategoryData.id)}
                          className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                        >
                          購入する
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedCategoryData.templates.map((template) => {
                    const isPurchased = purchasedTemplates.includes(selectedCategoryData.id) || 
                                      (selectedCategoryData.id === 'premium_pack' && isPremiumUser);
                    const isPreview = template.isPreview && !isPurchased;
                    
                    return (
                      <div key={template.id} className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {isPreview && <Lock className="w-4 h-4 text-gray-400" />}
                              {isPurchased && <Check className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-gray-800 leading-relaxed">
                              {isPreview ? template.content.substring(0, 100) + '...' : template.content}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {isPurchased ? (
                            <button
                              onClick={() => handleCopyTemplate(template)}
                              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              <span>{copiedTemplateId === template.id ? 'コピーしました！' : 'コピー'}</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2 text-gray-400">
                              <Lock className="w-4 h-4" />
                              <span>購入後に利用可能</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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