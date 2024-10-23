'use client';

import React from 'react';
import { Control, useWatch } from 'react-hook-form';


interface OrderItemInputProps {
  index: number;
  control: Control<any>;
  register: any;
  remove: (index: number) => void;
  errors: any;
}

const OrderItemInput: React.FC<OrderItemInputProps> = ({ index, control, register, remove, errors }) => {
  const quantity = useWatch({
    control,
    name: `items.${index}.quantity`,
    defaultValue: 1,
  });

  const unitPrice = useWatch({
    control,
    name: `items.${index}.unitPrice`,
    defaultValue: 0,
  });

  const totalPrice = quantity * unitPrice;

  return (
    <div className="border p-4 mb-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">アイテム {index + 1}</h3>
        <button
          type="button"
          onClick={() => remove(index)}
          className="text-red-500 hover:text-red-700"
        >
          削除
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">品目説明</label>
          <input
            {...register(`items.${index}.description`, { required: '品目説明は必須です。' })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
          {errors.items?.[index]?.description && (
            <span className="text-red-500 text-sm">
              {errors.items[index].description.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">数量</label>
          <input
            type="number"
            {...register(`items.${index}.quantity`, {
              required: '数量は必須です。',valueAsNumber: true,
              min: { value: 1, message: '数量は1以上でなければなりません。' },
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
          {errors.items?.[index]?.quantity && (
            <span className="text-red-500 text-sm">
              {errors.items[index].quantity.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">単価</label>
          <input
            type="number"
            {...register(`items.${index}.unitPrice`, {
              required: '単価は必須です。',
              min: { value: 0, message: '単価は0以上でなければなりません。' },
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
          {errors.items?.[index]?.unitPrice && (
            <span className="text-red-500 text-sm">
              {errors.items[index].unitPrice.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">合計金額</label>
          <input
            type="text"
            value={`¥${totalPrice.toLocaleString()}`}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderItemInput;