'use client'

import React, { useState, useEffect } from 'react'
import useAuthRedirect from '../hooks/useAuthRedirect'
import axios from '../../lib/axios.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/opus-components'

interface Stats {
  totalClients: number
  totalOrders: number
  totalInvoices: number
}

const DashboardPage: React.FC = () => {
  useAuthRedirect()
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalOrders: 0,
    totalInvoices: 0,
  });

  useEffect(() => {
    fetchStats()
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get<Stats>('/dashboard/stats')
      setStats(response.data);
    } catch (error) {
      console.error('統計情報の取得に失敗しました。', error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>取引先数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="test-2xl">{stats.totalClients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>受注数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="test-2xl">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>請求書数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="test-2xl">{stats.totalInvoices}</p>
          </CardContent>
        </Card>
      </div>
      {/* 必要に応じてグラフや統計情報を追加 */}
    </div>
  )
}

export default DashboardPage