// トークンの有効期限を確認するユーティリティ関数
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// リフレッシュトークンを使用して新しいアクセストークンを取得
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// アクセストークンの状態を確認し、必要に応じてリフレッシュする
export async function checkAndRefreshToken(accessToken: string | null): Promise<boolean> {
  if (!accessToken || isTokenExpired(accessToken)) {
    return await refreshAccessToken();
  }
  return true;
}

export async function checkAuthStatus() {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    // アクセストークンの状態を確認
    const isTokenValid = await checkAndRefreshToken(accessToken);
    if (!isTokenValid) {
      window.location.href = '/login';
      return null;
    }

    // 認証状態を確認するリクエストを送信
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // 再度リフレッシュを試みる
        const isRefreshSuccessful = await refreshAccessToken();
        if (!isRefreshSuccessful) {
          window.location.href = '/login';
          return null;
        }
        
        // 新しいトークンで再度認証状態を確認
        const retryResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (retryResponse.ok) {
          return await retryResponse.json();
        }
      }
      window.location.href = '/login';
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('認証状態の確認中にエラーが発生しました:', error);
    window.location.href = '/login';
    return null;
  }
}