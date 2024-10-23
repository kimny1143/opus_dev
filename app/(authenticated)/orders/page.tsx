'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order } from '@/lib/types';



const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '注文の取得に失敗しました。');
        }

        const data: Order[] = await response.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCreate = () => {
    router.push('/orders/create');
  };

  if (loading) {
    return <div className="text-center mt-10">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">発注一覧</h1>
      <button
        onClick={handleCreate}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        新規発注作成
      </button>
      {orders.length === 0 ? (
        <div>発注がありません。</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">発注番号</th>
              <th className="py-2 px-4 border-b">取引先</th>
              <th className="py-2 px-4 border-b">発行日</th>
              <th className="py-2 px-4 border-b">支払期限</th>
              <th className="py-2 px-4 border-b">ステータス</th>
              <th className="py-2 px-4 border-b">合計金額</th>
              <th className="py-2 px-4 border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-blue-500">
                  <Link href={`/orders/${order.id}`}>{order.orderNumber}</Link>
                </td>
                <td className="py-2 px-4 border-b">
                  {order.client.companyName || '未設定'}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(order.issueDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(order.dueDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b capitalize">{order.status}</td>
                <td className="py-2 px-4 border-b">¥{order.totalAmount.toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  <Link href={`/orders/${order.id}/edit`} className="text-green-500 hover:underline mr-2">
                    編集
                  </Link>
                  <button
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="text-red-500 hover:underline"
                  >
                    詳細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersPage;