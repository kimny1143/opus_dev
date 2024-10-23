'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/lib/api';
import { Client, Order, Invoice, InvoiceItem } from '@/lib/types';

const EditInvoicePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id ? Number(params.id) : null;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [issueDate, setIssueDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [status, setStatus] = useState<string>('unpaid');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // クライアントの取得
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients');
        setClients(response.data);
      } catch (error) {
        console.error('クライアントの取得に失敗しました:', error);
      }
    };

    fetchClients();
  }, []);

  // 請求書の取得
  useEffect(() => {
    if (invoiceId !== null) {
      const fetchInvoice = async () => {
        try {
          const response = await axios.get(`/api/invoices/${invoiceId}`);
          setInvoice(response.data);
          const fetchedInvoice = response.data as Invoice;
          setSelectedClient(fetchedInvoice.order.client.id);
          setSelectedOrder(fetchedInvoice.order.id);
          setIssueDate(fetchedInvoice.issueDate);
          setDueDate(fetchedInvoice.dueDate);
          setStatus(fetchedInvoice.status);
          setItems(fetchedInvoice.items);
        } catch (err: any) {
          console.error('請求書取得エラー:', err);
          setError(err.response?.data?.error || '請求書の取得に失敗しました。');
        } finally {
          setLoading(false);
        }
      };

      fetchInvoice();
    }
  }, [invoiceId]);

  // 選択されたクライアントに関連する注文の取得
  useEffect(() => {
    if (selectedClient !== null) {
      const fetchOrders = async () => {
        try {
          const response = await axios.get(`/api/clients/${selectedClient}/orders`);
          setOrders(response.data);
        } catch (error) {
          console.error('注文の取得に失敗しました:', error);
        }
      };

      fetchOrders();
    } else {
      setOrders([]);
      setSelectedOrder(null);
    }
  }, [selectedClient]);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index][field] = value as never;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrder === null) {
      alert('注文を選択してください。');
      return;
    }

    try {
      const updatedInvoice = await axios.put(`/api/invoices/${invoiceId}`, {
        orderId: selectedOrder,
        issueDate,
        dueDate,
        status,
        items,
      });
      alert('請求書が更新されました！');
      router.push(`/invoices/${updatedInvoice.data.id}`);
    } catch (error: any) {
      console.error('請求書更新エラー:', error);
      alert(
        error.response?.data?.error || '請求書の更新に失敗しました。'
      );
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!invoice) {
    return <div className="container mx-auto p-4">請求書が見つかりません。</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">請求書編集</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">クライアント</label>
          <select
            value={selectedClient ?? ''}
            onChange={(e) =>
              setSelectedClient(e.target.value ? Number(e.target.value) : null)
            }
            required
            className="w-full border p-2"
          >
            <option value="">クライアントを選択</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
        </div>
        {selectedClient !== null && (
          <div className="mb-4">
            <label className="block mb-1">注文</label>
            <select
              value={selectedOrder ?? ''}
              onChange={(e) =>
                setSelectedOrder(e.target.value ? Number(e.target.value) : null)
              }
              required
              className="w-full border p-2"
            >
              <option value="">注文を選択</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-1">発行日</label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
            className="w-full border p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">支払期日</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="w-full border p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">ステータス</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="w-full border p-2"
          >
            <option value="unpaid">未払い</option>
            <option value="paid">支払い済み</option>
            <option value="overdue">延滞</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">請求書アイテム</label>
          {items.map((item, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                placeholder="説明"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(index, 'description', e.target.value)
                }
                required
                className="flex-2 mr-2 border p-2"
              />
              <input
                type="number"
                placeholder="数量"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, 'quantity', Number(e.target.value))
                }
                required
                className="flex-1 mr-2 border p-2"
                min="1"
              />
              <input
                type="number"
                placeholder="単価"
                value={item.unitPrice}
                onChange={(e) =>
                  handleItemChange(index, 'unitPrice', Number(e.target.value))
                }
                required
                className="flex-1 mr-2 border p-2"
                min="0"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            アイテム追加
          </button>
        </div>
        <div className="mb-4">
          <p>Total Amount: {calculateTotal()} 円</p>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          請求書更新
        </button>
      </form>
    </div>
  );
};

export default EditInvoicePage;