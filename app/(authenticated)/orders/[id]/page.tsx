'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import { Order } from '@/lib/types';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${id}`);
        setOrder(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || '発注書の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleDelete = async () => {
    if (confirm('この発注書を本当に削除しますか？')) {
      try {
        await axios.delete(`/api/orders/${id}`);
        alert('発注書が削除されました。');
        router.push('/orders');
      } catch (err: any) {
        alert(err.response?.data?.error || '発注書の削除に失敗しました。');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-10">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="text-center mt-10">発注書が存在しません。</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">発注書詳細</h1>
      <div className="mb-4">
        <p><span className="font-semibold">発注書番号:</span> {order.orderNumber}</p>
        <p><span className="font-semibold">取引先:</span> {order.client.companyName || '未設定'}</p>
        <p><span className="font-semibold">発行日:</span> {new Date(order.issueDate).toLocaleDateString()}</p>
        <p><span className="font-semibold">支払期限:</span> {new Date(order.dueDate).toLocaleDateString()}</p>
        <p><span className="font-semibold">ステータス:</span> {order.status}</p>
        <p><span className="font-semibold">合計金額:</span> ¥{order.totalAmount.toLocaleString()}</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">発注アイテム</h2>
      {order.items.length === 0 ? (
        <p>アイテムがありません。</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">品目</th>
              <th className="py-2 px-4 border-b">数量</th>
              <th className="py-2 px-4 border-b">単価</th>
              <th className="py-2 px-4 border-b">合計金額</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{item.description}</td>
                <td className="py-2 px-4 border-b">{item.quantity}</td>
                <td className="py-2 px-4 border-b">¥{item.unitPrice.toLocaleString()}</td>
                <td className="py-2 px-4 border-b">¥{item.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 flex space-x-2">
        <Link href={`/orders/${id}/edit`}>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            編集
          </button>
        </Link>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          削除
        </button>
        <Link href="/orders">
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            戻る
          </button>
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailPage;