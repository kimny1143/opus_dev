// 共通のバリデーションロジック
import { useState, useEffect } from 'react';
import axios from 'axios';

// 文字列が空でないかチェック
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

// 文字列の長さが指定範囲内かチェック
export const isLengthWithinRange = (value: string, min: number, max: number): boolean => {
  const length = value.trim().length;
  return length >= min && length <= max;
};

// メールアドレスの形式チェック（より厳密なバリデーション）
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailRegex.test(email) && email.includes('.');
};

// 数値チェック（小数点も許可）
export const isNumber = (value: string): boolean => {
  return /^-?\d*\.?\d+$/.test(value);
};

// 数値が正の数かチェック
export const isPositiveNumber = (value: number): boolean => {
  return value > 0;
};

// 日付形式チェック (YYYY-MM-DD) と有効な日付かどうか
export const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

// 電話番号形式チェック（日本の場合、より厳密なバリデーション）
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^(0([1-9]{1}-?[1-9]\d{3}|[1-9]{2}-?\d{3}|[1-9]{2}\d{1}-?\d{2}|[1-9]{2}\d{2}-?\d{1})-?\d{4})$/;
  return phoneRegex.test(phoneNumber);
};

// パスワード強度チェック
export const isStrongPassword = (password: string): boolean => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// 登録番号の形式チェック
export const isValidRegistrationNumber = (value: string): boolean => {
  return /^T\d{13}$/.test(value);
};

// 発注書番号の一意性チェック（バックエンドと連携が必要）
export const isUniqueOrderNumber = async (orderNumber: string): Promise<boolean> => {
  try {
    const response = await axios.get(`/api/orders/check-unique?orderNumber=${orderNumber}`);
    return response.data.isUnique;
  } catch (error) {
    console.error('発注書番号の一意性チェックに失敗しました:', error);
    return false;
  }
};

// カスタムバリデーションフック
export const useValidation = (initialValue: string, validationFn: (value: string) => boolean) => {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(validationFn(value));
  }, [value, validationFn]);

  return { value, setValue, isValid };
};