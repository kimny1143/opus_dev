'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import axios from '@/lib/api';
import OrderItemInput from '@/app/(authenticated)/components/OrderItemInput';
import { Client, OrderItem } from '@prisma/client';
import { OrderFormProps, OrderFormData } from '@/lib/types';

const OrderForm: React.FC<OrderFormProps> = ({ initialData, onSubmit, submitButtonLabel }) => {
  const { register, control, handleSubmit, formState: { errors } } = useForm<OrderFormData>({
    defaultValues: initialData || {
      orderNumber: '',
      clientId: 0,
      issueDate: '',
      dueDate: '',
      status: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState<boolean>(true);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients');
        console.log('取得したクライアントデータ:', response.data);
        setClients(response.data);
      } catch (error: any) {
        setClientError('クライアントの取得に失敗しました。');
        console.error(error);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  const handleAddItem = () => {
    append({ description: '', quantity: 1, unitPrice: 0 });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        {loadingClients ? (
          <p>クライアントを読み込み中...</p>
        ) : clientError ? (
          <p className="text-red-500 text-sm">{clientError}</p>
        ) : (
          <select
            {...register('clientId', { required: '取引先は必須です。' })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">選択してください</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.companyName || '未設定'}
              </option>
            ))}
          </select>
        )}
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
          onClick={handleAddItem}
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
          {submitButtonLabel}
        </button>
      </div>
    </form>
  );
};

export default OrderForm;