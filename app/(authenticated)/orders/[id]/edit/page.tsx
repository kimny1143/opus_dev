'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/lib/api';
import OrderForm from '@/app/(authenticated)/components/OrderForm';
import { Order } from '@/lib/types';

const EditOrderPage: React.FC = () => {
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

  const handleSubmit = async (formData: any) => {
    try {
      await axios.put(`/api/orders/${id}`, formData);
      alert('発注書が更新されました！');
      router.push(`/orders/${id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || '発注書の更新に失敗しました。');
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
      <h1 className="text-2xl font-bold mb-4">発注書編集</h1>
      <OrderForm
        initialData={{
          ...order,
          clientId: order.client.id, // 'clientId' を追加
        }}
        onSubmit={handleSubmit}
        submitButtonLabel="更新する"
      />
    </div>
  );
};

export default EditOrderPage;