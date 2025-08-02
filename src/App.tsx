import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Sparkles, User, Crown, Menu, X, Settings } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import Templates from './components/Templates';
import Pricing from './components/Pricing';
import MyPage from './components/MyPage';
import AuthModal from './components/AuthModal';
import { SentryErrorBoundary } from './config/sentry';

// 認証が必要なルートのラッパーコンポーネント
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useAuth();
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ナビゲーションヘッダーコンポーネント
function NavigationHeader() {
  const { user: authUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLogin = (userData: { uid: string; name: string; email: string }) => {
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const isAuthenticated = !!authUser;

  // 認証が必要なページかチェック
  const isProtectedRoute = ['/templates', '/mypage'].includes(location.pathname);
  const isPublicRoute = ['/', '/pricing', '/login'].includes(location.pathname);

  // 認証が必要なページに未認証でアクセスした場合
  if (isProtectedRoute && !isAuthenticated) {
    return null; // リダイレクトされるので何も表示しない
  }

  // ログインページの場合はヘッダーを表示しない
  if (location.pathname === '/login') {
    return null;
  }

  // ナビゲーションアイテム
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        { id: '/', name: 'AI返信生成', icon: Sparkles },
        { id: '/pricing', name: '料金プラン', icon: Crown }
      ];
    }
    
    return [
      { id: '/', name: 'AI返信生成', icon: Sparkles },
      { id: '/templates', name: 'テンプレート', icon: MessageCircle },
      { id: '/mypage', name: 'マイページ', icon: Settings }
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MoteTalk</span>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* ユーザーメニュー */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-700">
                    {authUser.name || authUser.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  ログイン
                </button>
              )}

              {/* モバイルメニューボタン */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* モバイルメニュー */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? 'text-purple-600 bg-purple-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 認証モーダル */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
}

// ログインページコンポーネント
function LoginPage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  // 既にログインしている場合はダッシュボードにリダイレクト
  if (authUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">MoteTalkへようこそ</h2>
          <p className="text-gray-600">マッチングアプリ専用AI会話アシスタント</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
        >
          今すぐ始める
        </button>
      </div>
    </div>
  );
}

function App() {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
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
    <SentryErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          <NavigationHeader />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/templates" element={
                <ProtectedRoute>
                  <Templates />
                </ProtectedRoute>
              } />
              <Route path="/mypage" element={
                <ProtectedRoute>
                  <MyPage />
                </ProtectedRoute>
              } />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SentryErrorBoundary>
  );
}

export default App;