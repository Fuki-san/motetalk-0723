// 認証関連の共通ユーティリティ
export const getAuthToken = async (): Promise<string> => {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('ユーザーが認証されていません');
  }
  
  const token = await currentUser.getIdToken();
  if (!token) {
    throw new Error('認証トークンが取得できません');
  }
  
  return token;
};

// API呼び出しの共通ヘルパー
export const apiCall = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    const token = await getAuthToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API call error:', error);
    throw error;
  }
}; 