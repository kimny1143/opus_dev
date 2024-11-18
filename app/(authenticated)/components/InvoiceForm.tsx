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
    formState: { errors, touchedFields },
  } = useForm<ExtendedInvoiceFormData>({
    defaultValues: initialData || {
      orderId: 0,
      issueDate: '',
      dueDate: '',
      status: '',
      direction: 'client_to_user',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
    mode: 'onChange', // リアルタイムバリデーション用に変更
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
      {/* 請求書番号フィールド */}
      <div className="mb-4">
        <label className="block mb-1" htmlFor="invoiceNumber">
          請求書番号 <span className="text-red-500">*</span>
        </label>
        <input
          id="invoiceNumber"
          type="text"
          {...register('invoiceNumber', { required: '請求書番号は必須です。' })}
          className={`w-full border p-2 ${errors.invoiceNumber ? 'border-red-500' : ''}`}
          placeholder="請求書番号"
        />
        {touchedFields.invoiceNumber && errors.invoiceNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.invoiceNumber.message}</p>
        )}
      </div>
      
      {/* 請求書の方向性 */}
      <div className="mb-4">
        <label className="block mb-1" htmlFor="direction">
          請求書の方向性 <span className="text-red-500">*</span>
        </label>
        <select
          id="direction"
          {...register('direction', { required: '方向性を選択してください。' })}
          className={`w-full border p-2 ${errors.direction ? 'border-red-500' : ''}`}
        >
          <option value="client_to_user">クライアントからユーザーへ</option>
          <option value="user_to_client">ユーザーからクライアントへ</option>
        </select>
        {touchedFields.direction && errors.direction && (
          <p className="text-red-500 text-sm mt-1">{errors.direction.message}</p>
        )}
      </div>

      {/* 発注書選択 */}
      <div className="mb-4">
        <label className="block mb-1" htmlFor="orderId">
          発注書 <span className="text-red-500">*</span>
        </label>
        <select
          id="orderId"
          {...register('orderId', { required: '発注書を選択してください。' })}
          className={`w-full border p-2 ${errors.orderId ? 'border-red-500' : ''}`}
        >
          <option value="">選択してください</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.orderNumber}
            </option>
          ))}
        </select>
        {touchedFields.orderId && errors.orderId && (
          <p className="text-red-500 text-sm mt-1">{errors.orderId.message}</p>
        )}
      </div>

      {/* 発行日 */}
      <div className="mb-4">
        <label className="block mb-1" htmlFor="issueDate">
          発行日 <span className="text-red-500">*</span>
        </label>
        <input
          id="issueDate"
          type="date"
          {...register('issueDate', { required: '発行日を入力してください。' })}
          className={`w-full border p-2 ${errors.issueDate ? 'border-red-500' : ''}`}
          max={new Date().toISOString().split('T')[0]} // 今日以前の日付のみ選択可能
        />
        {touchedFields.issueDate && errors.issueDate && (
          <p className="text-red-500 text-sm mt-1">{errors.issueDate.message}</p>
        )}
      </div>

      {/* 支払期日 */}
      <div className="mb-4">
        <label className="block mb-1" htmlFor="dueDate">
          支払期日 <span className="text-red-500">*</span>
        </label>
        <input
          id="dueDate"
          type="date"
          {...register('dueDate', { required: '支払期日を入力してください。' })}
          className={`w-full border p-2 ${errors.dueDate ? 'border-red-500' : ''}`}
          min={watch('issueDate') || new Date().toISOString().split('T')[0]} // 発行日以降の日付のみ選択可能
        />
        {touchedFields.dueDate && errors.dueDate && (
          <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
        )}
      </div>

      {/* ステータス */}
      <div className="mb-4">
        <label className="block mb-1" htmlFor="status">
          ステータス <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          {...register('status', { required: 'ステータスを選択してください。' })}
          className={`w-full border p-2 ${errors.status ? 'border-red-500' : ''}`}
        >
          <option value="unpaid">未払い</option>
          <option value="paid">支払い済み</option>
          <option value="overdue">延滞</option>
        </select>
        {touchedFields.status && errors.status && (
          <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
        )}
      </div>

      {/* 請求書アイテム */}
      <div className="mb-4">
        <label className="block mb-1">
          請求書アイテム <span className="text-red-500">*</span>
        </label>
        {fields.map((item, index) => (
          <div key={item.id} className="flex mb-2">
            <div className="flex-2 mr-2">
              <input
                id={`description-${index}`}
                type="text"
                placeholder="説明"
                {...register(`items.${index}.description`, {
                  required: '説明を入力してください。',
                })}
                className={`w-full border p-2 ${
                  errors.items?.[index]?.description ? 'border-red-500' : ''
                }`}
              />
              {touchedFields.items?.[index]?.description && errors.items?.[index]?.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.items[index].description?.message}
                </p>
              )}
            </div>

            {/* 数量 */}
            <div className="flex-1 mr-2">
              <input
                id={`quantity-${index}`}
                type="number"
                placeholder="数量"
                {...register(`items.${index}.quantity`, {
                  required: '数量を入力してください。',
                  min: { value: 1, message: '数量は1以上でなければなりません。' },
                })}
                className={`w-full border p-2 ${
                  errors.items?.[index]?.quantity ? 'border-red-500' : ''
                }`}
                min="1"
                step="1"
              />
              {touchedFields.items?.[index]?.quantity && errors.items?.[index]?.quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.items[index].quantity?.message}
                </p>
              )}
            </div>

            {/* 単価 */}
            <div className="flex-1 mr-2">
              <input
                id={`unitPrice-${index}`}
                type="number"
                placeholder="単価"
                {...register(`items.${index}.unitPrice`, {
                  required: '単価を入力してください。',
                  min: { value: 0, message: '単価は0以上でなければなりません。' },
                })}
                className={`w-full border p-2 ${
                  errors.items?.[index]?.unitPrice ? 'border-red-500' : ''
                }`}
                min="0"
                step="1"
              />
              {touchedFields.items?.[index]?.unitPrice && errors.items?.[index]?.unitPrice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.items[index].unitPrice?.message}
                </p>
              )}
            </div>

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
        <label className="block mb-1" htmlFor="totalAmount">総額</label>
        <input
          id="totalAmount"
          type="text"
          value={`¥${watch('items').reduce(
            (total: number, item: InvoiceItem) => total + item.quantity * item.unitPrice,
            0
          ).toLocaleString()}`} // 金額をカンマ区切りで表示
          readOnly
          className="w-full border p-2 bg-gray-100"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
      >
        {initialData ? '更新する' : '作成する'}
      </button>
    </form>
  );
};

export default InvoiceForm;