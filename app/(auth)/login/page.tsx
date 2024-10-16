'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { Input, Card, CardHeader, CardContent, CardFooter } from '@/app/components/ui/opus-components';
import { useAuth } from '@/app/providers/AuthProvider';
import Cookies from 'js-cookie';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('ログイン処理開始');
    setError(null);
    setIsLoading(true);

    try {
      console.log('APIリクエスト送信:', email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        console.log('ログイン成功');
        const data = await response.json();
        // auth_tokenという名前でクッキーを設定
        Cookies.set('auth_token', data.token, { expires: 7 });
        await login(email, password);
        console.log('ダッシュボードへリダイレクト');
        router.push('/dashboard');
      } else {
        console.log('ログイン失敗');
        const errorData = await response.json();
        setError(errorData.error || 'ログインに失敗しました');
      }
    } catch (err) {
      console.error('ログインエラー:', err);
      setError('ログイン処理中にエラーが発生しました');
    } finally {
      console.log('ログイン処理終了');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h2 className="text-xl font-bold">ログイン</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <div className="mb-3">
              <Input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <Input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="w-full text-center">
            <Link href="/register" className="text-blue-500 hover:underline">
              アカウントをお持ちでない方はこちら
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;