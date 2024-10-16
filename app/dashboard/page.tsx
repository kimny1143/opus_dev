'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

const DashboardPage = () => {
  const [stats, setStats] = useState<{ userCount: number; clientCount: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('統計情報の取得に失敗しました。', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1>ダッシュボード</h1>
      {stats ? (
        <div>
          <p>ユーザー数: {stats.userCount}</p>
          <p>取引先数: {stats.clientCount}</p>
          {/* 他の統計情報も表示 */}
        </div>
      ) : (
        <p>統計情報を読み込み中...</p>
      )}
    </div>
  );
};

export default DashboardPage;