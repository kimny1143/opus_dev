'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import InvoiceForm from '@/app/(authenticated)/components/InvoiceForm';
import { InvoiceFormData, Client, Order } from '@/lib/types';
import { 
  isValidDate, 
  isIssueDateValid, 
  isDueDateValid, 
  isPositiveNumber,
  validateInvoiceItems,
  validateInvoiceRequiredFields,
  isNotEmpty
} from '@/lib/validation';

const CreateInvoicePage: React.FC = () => {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients');
        setClients(response.data);
        setLoading(false);
      } catch (error) {
        console.error('クライアントの取得に失敗しました:', error);
        setError('クライアントの取得に失敗しました。');
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const validateForm = (data: InvoiceFormData): boolean => {
    const errors: {[key: string]: string} = {};

    // 必須フィールドの検証
    if (!validateInvoiceRequiredFields(String(data.orderId), data.issueDate, data.dueDate, data.status, data.items)) {
      errors.required = '必須項目をすべて入力してください。';
    }

    // 発注書番号の検証
    if (!isNotEmpty(String(data.orderId))) {
      errors.orderId = '発注書番号は必須です。';
    }

    // 発行日の検証
    if (!isValidDate(data.issueDate)) {
      errors.issueDate = '有効な発行日を入力してください。';
    } else if (!isIssueDateValid(data.issueDate)) {
      errors.issueDate = '発行日は現在の日付以前である必要があります。';
    }

    // 支払期日の検証
    if (!isValidDate(data.dueDate)) {
      errors.dueDate = '有効な支払期日を入力してください。';
    } else if (!isDueDateValid(data.issueDate, data.dueDate)) {
      errors.dueDate = '支払期日は発行日より後である必要があります。';
    }

    // アイテムの検証
    if (!Array.isArray(data.items) || data.items.length === 0) {
      errors.items = '少なくとも1つのアイテムが必要です。';
    } else if (!validateInvoiceItems(data.items)) {
      data.items.forEach((item, index) => {
        if (!item.description) {
          errors[`items.${index}.description`] = '説明は必須です。';
        }
        if (!isPositiveNumber(item.quantity)) {
          errors[`items.${index}.quantity`] = '数量は1以上の数値を入力してください。';
        }
        if (!isPositiveNumber(item.unitPrice)) {
          errors[`items.${index}.unitPrice`] = '単価は0以上の数値を入力してください。';
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (data: InvoiceFormData) => {
    setValidationErrors({}); // エラーをリセット

    if (!validateForm(data)) {
      // エラーメッセージをユーザーに表示
      const errorMessage = Object.values(validationErrors).join('\n');
      alert('入力内容に問題があります:\n' + errorMessage);
      return;
    }

    try {
      const newInvoice = await axios.post('/api/invoices', {
        orderId: data.orderId,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        status: data.status,
        items: data.items,
      });
      alert('請求書が正常に作成されました！');
      router.push(`/invoices/${newInvoice.data.id}`);
    } catch (error: any) {
      console.error('請求書作成エラー:', error);
      alert(
        error.response?.data?.error?.message || '請求書の作成に失敗しました。もう一度お試しください。'
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