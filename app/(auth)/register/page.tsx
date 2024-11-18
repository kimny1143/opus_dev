'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { Input, Card, CardHeader, CardContent } from '@/app/components/ui/opus-components';
import axios from 'axios';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): boolean => {
    // 8文字以上
    if (password.length < 8) return false;
    
    // 大文字を含む
    if (!/[A-Z]/.test(password)) return false;
    
    // 小文字を含む
    if (!/[a-z]/.test(password)) return false;
    
    // 数字を含む
    if (!/[0-9]/.test(password)) return false;
    
    // 特殊文字を含む
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    
    return true;
  };

  const validateEmail = async (email: string): Promise<boolean> => {
    // 基本的なメール形式チェック
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      setError('無効なメールアドレス形式です');
      return false;
    }

    try {
      // メールアドレスの重複チェック
      const response = await axios.post('/api/check-email', { email });
      return true;
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError('このメールアドレスは既に登録されています');
        return false;
      }
      throw error;
    }
  };

  const validateForm = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('すべてのフィールドを入力してください。');
      return false;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return false;
    }

    if (!validatePassword(password)) {
      setError('パスワードは8文字以上で、大文字・小文字・数字・特殊文字(!@#$%^&*()など)を含める必要があります。');
      return false;
    }

    return await validateEmail(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!await validateForm()) {
        setIsLoading(false);
        return;
      }

      await register(name, email, password);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('登録に失敗しました。入力内容を確認してください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h2 className="text-xl font-bold mb-4">新規登録</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <Input
              type="text"
              placeholder="ユーザー名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-3"
              required
            />
            <Input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3"
              required
            />
            <Input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-3"
              required
            />
            <Input
              type="password"
              placeholder="パスワード確認"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mb-3"
              required
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '登録中...' : '登録'}
            </Button>
            <p className="mt-4 text-center">
              既にアカウントをお持ちですか？ <Link href="/login" className="text-blue-500">ログイン</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;