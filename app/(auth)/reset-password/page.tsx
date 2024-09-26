'use client';

import React, { useState } from 'react';
import axios from '../../../lib/axios.js';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/opus-components';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/auth/reset-password', { email });
      setMessage('パスワードリセットメールを送信しました。');
      setError(null);
    } catch (err) {
      setError('パスワードリセットに失敗しました。');
      setMessage(null);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>パスワードリセット</CardTitle>
          </CardHeader>
          <CardContent>
            {message && <p className="text-green-500 mb-3">{message}</p>}
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <Input
              type="email"
              name="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-4"
            />
            <Button type="submit">リセットメール送信</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ResetPasswordPage;