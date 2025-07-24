import React, { useEffect, useState } from 'react';
import { Check, Crown, MessageCircle, ArrowRight, Loader } from 'lucide-react';
import { checkPurchaseStatus } from '../services/stripeService';
import { useAuth } from '../hooks/useAuth';
import { getAuth } from 'firebase/auth';

const SuccessPage = () => {
  const [purchaseInfo, setPurchaseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      checkPurchaseStatus(sessionId)
        .then(info => {
          setPurchaseInfo(info);
          console.log('✅ 購入情報確認完了:', info);
        })
        .catch(error => {
          console.error('❌ 購入状況確認エラー:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.warn('⚠️ session_idが見つかりません');
      setLoading(false);
    }
  }, []);

  // 認証状態と購入情報に基づいて自動リダイレクト
  useEffect(() => {
    if (!authLoading && !loading && purchaseInfo) {
      const autoRedirect = async () => {
        // 少し待機してWebhook処理の完了を待つ
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 購入後にユーザー情報を再取得
        try {
          const currentUser = getAuth().currentUser;
          if (currentUser) {
            const token = await currentUser.getIdToken(true); // 強制リフレッシュ
            console.log('🔄 購入後のユーザートークンをリフレッシュ');
          }
        } catch (error) {
          console.warn('⚠️ トークンリフレッシュエラー:', error);
        }
        
        setRedirecting(true);
        
        if (purchaseInfo.type === 'subscription') {
          console.log('🔄 プレミアムユーザーとしてダッシュボードに遷移');
          window.location.href = '/dashboard';
        } else {
          console.log('🔄 テンプレート購入者としてテンプレートページに遷移');
          window.location.href = '/templates?view=purchased';
        }
      };
      
      autoRedirect();
    }
  }, [authLoading, loading, purchaseInfo]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">購入情報を確認中...</p>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {purchaseInfo?.type === 'subscription' 
              ? 'プレミアム機能を有効化中...'
              : 'テンプレートを準備中...'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          購入が完了しました！
        </h1>
        
        <p className="text-gray-600 mb-6">
          MoteTalkをご利用いただき、ありがとうございます。
          {purchaseInfo?.type === 'subscription' 
            ? 'プレミアムプランが有効になりました。'
            : 'テンプレートパックをご利用いただけます。'
          }
        </p>

        <div className="space-y-3 mb-8">
          {purchaseInfo?.type === 'subscription' ? (
            <>
              <button
                onClick={() => {
                  setRedirecting(true);
                  window.location.href = '/dashboard';
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <Crown className="w-4 h-4 inline mr-2" />
                プレミアム機能を利用する
              </button>
              
              <button
                onClick={() => {
                  setRedirecting(true);
                  window.location.href = '/';
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                ホームに戻る
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setRedirecting(true);
                  window.location.href = '/templates?view=purchased';
                }}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200"
              >
                <Crown className="w-4 h-4 inline mr-2" />
                購入済みテンプレートを見る
              </button>
              
              <button
                onClick={() => {
                  setRedirecting(true);
                  window.location.href = '/dashboard';
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                AI返信生成を始める
              </button>
            </>
          )}
        </div>

        <div className="text-sm text-gray-500">
          <p>ご不明な点がございましたら、</p>
          <p>サポートまでお気軽にお問い合わせください。</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;