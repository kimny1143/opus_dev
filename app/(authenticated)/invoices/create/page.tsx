'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import InvoiceForm from '@/app/(authenticated)/components/InvoiceForm';
import { InvoiceFormData, Client, Order } from '@/lib/types';

const CreateInvoicePage: React.FC = () => {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients');
        setClients(response.data);
      } catch (error) {
        console.error('クライアントの取得に失敗しました:', error);
        setError('クライアントの取得に失敗しました。');
      }
    };

    fetchClients();
  }, []);

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      const newInvoice = await axios.post('/api/invoices', {
        // invoiceNumber はサーバー側で自動生成
        orderId: data.orderId,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        status: data.status,
        items: data.items,
      });
      alert('請求書が作成されました！');
      router.push(`/invoices/${newInvoice.data.id}`);
    } catch (error: any) {
      console.error('請求書作成エラー:', error);
      alert(
        error.response?.data?.error || '請求書の作成に失敗しました。'
      );
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        エラー: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">請求書作成</h1>
      <InvoiceForm
        clients={clients}
        orders={orders}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CreateInvoicePage;