'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const [stats, setStats] = useState<{ userCount: number; clientCount: number } | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('統計情報の取得に失敗しました。', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{user.name}さん！</p>
      {stats ? (
        <div>
          <p>ユーザー数: {stats.userCount}</p>
          <p>取引先数: {stats.clientCount}</p>
        </div>
      ) : (
        <p>統計情報を読み込み中...</p>
      )}
    </div>
  );
};

export default DashboardPage;