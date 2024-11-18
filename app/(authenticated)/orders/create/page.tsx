'use client';

import api from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import OrderItemInput from '@/app/(authenticated)/components/OrderItemInput';
import { Client, OrderFormData } from '@/lib/types';
import { isValidDate, isIssueDateValid, isDueDateValid, isPositiveNumber } from '@/lib/validation';

const CreateOrderPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<OrderFormData>({
    defaultValues: {
      clientId: 0,
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });
  const router = useRouter();

  // フォームの値を監視
  const issueDate = watch('issueDate');
  const dueDate = watch('dueDate');
  const items = watch('items');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/api/clients');
        console.log('取得したクライアントデータ:', response.data);
        setClients(response.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.error('認証エラー: ログインページにリダイレクトします。');
          router.push('/login');
        } else {
          console.error('クライアントデータの取得に失敗しました。', error);
        }
      }
    };
  
    fetchClients();
  }, []);

  const validateForm = (data: OrderFormData): boolean => {
    const errors: { [key: string]: string } = {};

    // 発行日のバリデーション
    if (!isValidDate(data.issueDate)) {
      errors.issueDate = '有効な発行日を入力してください。';
    } else if (!isIssueDateValid(data.issueDate)) {
      errors.issueDate = '発行日は現在の日付以前である必要があります。';
    }

    // 支払期限のバリデーション
    if (!isValidDate(data.dueDate)) {
      errors.dueDate = '有効な支払期限を入力してください。';
    } else if (!isDueDateValid(data.issueDate, data.dueDate)) {
      errors.dueDate = '支払期限は発行日より後である必要があります。';
    }

    // アイテムのバリデーション
    if (!Array.isArray(data.items) || data.items.length === 0) {
      errors.items = '少なくとも1つのアイテムが必要です。';
    } else {
      data.items.forEach((item, index) => {
        if (!item.description) {
          errors[`items.${index}.description`] = '説明は必須です。';
        }
        if (!isPositiveNumber(Number(item.quantity))) {
          errors[`items.${index}.quantity`] = '数量は正の数である必要があります。';
        }
        if (!isPositiveNumber(Number(item.unitPrice))) {
          errors[`items.${index}.unitPrice`] = '単価は正の数である必要があります。';
        }
      });
    }

    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!validateForm(data)) {
      return;
    }

    try {
      const payload = {
        ...data,
        clientId: Number(data.clientId),
        items: data.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      };

      await api.post('/api/orders', payload);
      alert('発注書が作成されました！');
      router.push('/orders');
    } catch (error: any) {
      alert(error.response?.data?.error || '発注書の作成に失敗しました。');
      console.error('注文作成エラー:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">新規発注書作成</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">発注書番号</label>
          <input
            {...register('orderNumber', { required: '発注書番号は必須です。' })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
          {errors.orderNumber && <span className="text-red-500 text-sm">{errors.orderNumber.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">取引先</label>
          <select
            {...register('clientId', { required: '取引先は必須です。' })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">選択してください</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
          {errors.clientId && <span className="text-red-500 text-sm">{errors.clientId.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">発行日</label>
            <input
              type="date"
              {...register('issueDate', { required: '発行日は必須です。' })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {errors.issueDate && <span className="text-red-500 text-sm">{errors.issueDate.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">支払期限</label>
            <input
              type="date"
              {...register('dueDate', { required: '支払期限は必須です。' })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {errors.dueDate && <span className="text-red-500 text-sm">{errors.dueDate.message}</span>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ステータス</label>
          <select
            {...register('status', { required: 'ステータスは必須です。' })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">選択してください</option>
            <option value="pending">保留中</option>
            <option value="confirmed">確認済み</option>
            <option value="shipped">発送済み</option>
          </select>
          {errors.status && <span className="text-red-500 text-sm">{errors.status.message}</span>}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">発注アイテム</h2>
          {fields.map((field, index) => (
            <OrderItemInput
              key={field.id}
              index={index}
              control={control}
              register={register}
              remove={remove}
              errors={errors}
            />
          ))}
          <button
            type="button"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            アイテム追加
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            作成する
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;