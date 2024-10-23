'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { InvoiceFormData } from '@/lib/types';
import { Client, Order, InvoiceItem, ExtendedInvoiceFormData } from '@/lib/types';
import { InvoiceFormProps } from '@/lib/types';


const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialData,
  clients,
  orders,
  onSubmit,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExtendedInvoiceFormData>({
    defaultValues: initialData || {
      orderId: 0,
      issueDate: '',
      dueDate: '',
      status: '',
      direction: 'client_to_user',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
    mode: 'onSubmit',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedClientId = watch('orderId');

  useEffect(() => {
    if (initialData) {
      setValue('orderId', initialData.orderId);
      setValue('issueDate', initialData.issueDate);
      setValue('dueDate', initialData.dueDate);
      setValue('status', initialData.status);
      setValue('direction', initialData.direction);
      setValue('items', initialData.items);
    }
  }, [initialData, setValue]);

  const onValidSubmit = (data: ExtendedInvoiceFormData) => {
    const issueDate = new Date(data.issueDate);
    const dueDate = new Date(data.dueDate);

    if (dueDate <= issueDate) {
      alert('支払期日は発行日より後の日付を選択してください。');
      return;
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onValidSubmit)}>
      {/* 請求書の方向性 */}
      <div className="mb-4">
        <label className="block mb-1">請求書の方向性</label>
        <select
          {...register('direction', { required: true })}
          className="w-full border p-2"
        >
          <option value="client_to_user">クライアントからユーザーへ</option>
          <option value="user_to_client">ユーザーからクライアントへ</option>
        </select>
        {errors.direction && (
          <p className="text-red-500 text-sm mt-1">方向性を選択してください。</p>
        )}
      </div>

      {/* 発注書選択 */}
      <div className="mb-4">
        <label className="block mb-1">発注書</label>
        <select
          {...register('orderId', { required: '発注書を選択してください。' })}
          className="w-full border p-2"
        >
          <option value="">選択してください</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.orderNumber}
            </option>
          ))}
        </select>
        {errors.orderId && (
          <p className="text-red-500 text-sm mt-1">{errors.orderId.message}</p>
        )}
      </div>

      {/* 発行日 */}
      <div className="mb-4">
        <label className="block mb-1">発行日</label>
        <input
          type="date"
          {...register('issueDate', { required: '発行日を入力してください。' })}
          className="w-full border p-2"
        />
        {errors.issueDate && (
          <p className="text-red-500 text-sm mt-1">{errors.issueDate.message}</p>
        )}
      </div>

      {/* 支払期日 */}
      <div className="mb-4">
        <label className="block mb-1">支払期日</label>
        <input
          type="date"
          {...register('dueDate', { required: '支払期日を入力してください。' })}
          className="w-full border p-2"
        />
        {errors.dueDate && (
          <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
        )}
      </div>

      {/* ステータス */}
      <div className="mb-4">
        <label className="block mb-1">ステータス</label>
        <select
          {...register('status', { required: 'ステータスを選択してください。' })}
          className="w-full border p-2"
        >
          <option value="unpaid">未払い</option>
          <option value="paid">支払い済み</option>
          <option value="overdue">延滞</option>
        </select>
        {errors.status && (
          <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
        )}
      </div>

      {/* 請求書アイテム */}
      <div className="mb-4">
        <label className="block mb-1">請求書アイテム</label>
        {fields.map((item, index) => (
          <div key={item.id} className="flex mb-2">
            <input
              type="text"
              placeholder="説明"
              {...register(`items.${index}.description`, {
                required: '説明を入力してください。',
              })}
              className="flex-2 mr-2 border p-2"
            />
            {errors.items?.[index]?.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.items[index].description?.message}
              </p>
            )}

            {/* 数量 */}
            <input
              type="number"
              placeholder="数量"
              {...register(`items.${index}.quantity`, {
                required: '数量を入力してください。',
                min: { value: 1, message: '数量は1以上でなければなりません。' },
              })}
              className="flex-1 mr-2 border p-2"
              min="1"
            />
            {errors.items?.[index]?.quantity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.items[index].quantity?.message}
              </p>
            )}

            {/* 単価 */}
            <input
              type="number"
              placeholder="単価"
              {...register(`items.${index}.unitPrice`, {
                required: '単価を入力してください。',
                min: { value: 0, message: '単価は0以上でなければなりません。' },
              })}
              className="flex-1 mr-2 border p-2"
              min="0"
            />
            {errors.items?.[index]?.unitPrice && (
              <p className="text-red-500 text-sm mt-1">
                {errors.items[index].unitPrice?.message}
              </p>
            )}

            {/* アイテムの削除ボタン */}
            <button
              type="button"
              onClick={() => remove(index)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              削除
            </button>
          </div>
        ))}
        {/* アイテムの追加ボタン */}
        <button
          type="button"
          onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          アイテム追加
        </button>
      </div>

      {/* 合計金額 */}
      <div className="mb-4">
        <label className="block mb-1">総額</label>
        <input
          type="text"
          value={`¥${watch('items').reduce(
            (total: number, item: InvoiceItem) => total + item.quantity * item.unitPrice,
            0
          )}`}
          readOnly
          className="w-full border p-2 bg-gray-100"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        {initialData ? '更新する' : '作成する'}
      </button>
    </form>
  );
};

export default InvoiceForm;