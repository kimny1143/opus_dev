'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; // 認証設定済みの axios インスタンスを使用
import { useRouter } from 'next/navigation';
import { Invoice } from '@/lib/types';

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/api/invoices');
        setInvoices(response.data);
      } catch (err: any) {
        console.error('請求書の取得に失敗しました:', err);
        setError('請求書の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

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
      <h1 className="text-2xl font-bold mb-4">請求書管理</h1>
      <button
        onClick={() => router.push('/invoices/create')}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        新規請求書作成
      </button>
      {invoices.length === 0 ? (
        <p>請求書がありません。</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">請求書番号</th>
              <th className="py-2 px-4 border-b">発行日</th>
              <th className="py-2 px-4 border-b">支払期日</th>
              <th className="py-2 px-4 border-b">ステータス</th>
              <th className="py-2 px-4 border-b">クライアント</th>
              <th className="py-2 px-4 border-b">発注番号</th>
              <th className="py-2 px-4 border-b">合計金額</th>
              <th className="py-2 px-4 border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-blue-500">
                  <Link href={`/invoices/${invoice.id}`}>
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b capitalize">
                  {invoice.status === 'unpaid'
                    ? '未払い'
                    : invoice.status === 'paid'
                    ? '支払い済み'
                    : '延滞'}
                </td>
                <td className="py-2 px-4 border-b">
                  {invoice.recipientClient
                    ? invoice.recipientClient.companyName
                    : invoice.issuerClient
                    ? invoice.issuerClient.companyName
                    : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  {invoice.order ? invoice.order.orderNumber : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  ¥{invoice.totalAmount.toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">
                  <Link
                    href={`/invoices/${invoice.id}/edit`}
                    className="text-green-500 hover:underline mr-2"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                    className="text-blue-500 hover:underline"
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

export default InvoicesPage;