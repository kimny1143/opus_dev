export async function checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      console.log('認証状態:', data);
      return data;
    } catch (error) {
      console.error('認証状態の確認中にエラーが発生しました:', error);
      return null;
    }
  }