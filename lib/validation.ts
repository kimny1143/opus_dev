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

// 数値が正の数かをチェック
export const isPositiveNumber = (value: number): boolean => {
  return Number.isFinite(value) && value > 0;
};

// 日付が有効かどうかをチェック
export const isValidDate = (dateString: string): boolean => {
  // 正規表現で YYYY-MM-DD の形式をチェック
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!regEx.test(dateString)) return false;

  // 日付が実在するかをチェック
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) return false;

  // 月と日が正しいかを確認（例: 2023-02-30 などを弾く）
  const [year, month, day] = dateString.split('-').map(Number);
  const validDate = new Date(year, month - 1, day);
  return (
    validDate.getFullYear() === year &&
    validDate.getMonth() === month - 1 &&
    validDate.getDate() === day
  );
};

// 発行日が現在の日付以前かをチェック
export const isIssueDateValid = (issueDate: string): boolean => {
  const issue = new Date(issueDate);
  const today = new Date();
  return issue <= today;
};

// 支払期日が発行日より後かをチェック
export const isDueDateValid = (issueDate: string, dueDate: string): boolean => {
  const issue = new Date(issueDate);
  const due = new Date(dueDate);
  return due > issue;
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

// 請求書アイテムのバリデーション
export const validateInvoiceItems = (items: any[]): boolean => {
  return items.every(item => {
    return (
      item.description && 
      item.description.trim() !== '' &&
      isPositiveNumber(item.quantity) &&
      isPositiveNumber(item.unitPrice)
    );
  });
};

// 請求書の必須フィールドチェック
export const validateInvoiceRequiredFields = (
  orderId: string,
  issueDate: string,
  dueDate: string,
  status: string,
  items: any[]
): boolean => {
  return !!(orderId && issueDate && dueDate && status && items);
};