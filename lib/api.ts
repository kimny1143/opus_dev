// lib/api.ts

import axios from 'axios';
import { OrderFormData, InvoiceFormData } from '@/lib/types';
import { useRouter } from 'next/navigation';

// Axiosインスタンスの作成
const instance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // クッキーを含める
});

// エラーレスポンスのインターセプター
instance.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    // 認証エラーの場合、ログインページにリダイレクト
    if (response?.status === 401 || response?.status === 403) {
      window.location.href = '/login';
      return Promise.reject({
        code: 'AUTH_ERROR',
        message: '認証に失敗しました。再度ログインしてください。'
      });
    }

    // サーバーからのエラーレスポンスを統一形式に変換
    if (response?.data?.error) {
      return Promise.reject({
        code: response.data.error.code || 'API_ERROR',
        message: response.data.error.message || 'APIエラーが発生しました。'
      });
    }

    // その他のエラー
    return Promise.reject({
      code: 'UNKNOWN_ERROR',
      message: '予期せぬエラーが発生しました。'
    });
  }
);

export default instance;

// エラーハンドリング共通関数
const handleApiError = (error: any, context: string): never => {
  console.error(`${context}:`, error);
  throw {
    code: error.code || 'API_ERROR',
    message: error.message || `${context}に失敗しました。`
  };
};

// 発注書一覧を取得する関数
export const fetchOrders = async () => {
  try {
    const response = await instance.get('/orders');
    return response.data;
  } catch (error: any) {
    handleApiError(error, '発注書一覧の取得');
  }
};

// 特定の発注書を取得する関数
export const fetchOrder = async (id: number) => {
  try {
    const response = await instance.get(`/orders/${id}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, `ID ${id} の発注書の取得`);
  }
};

// 新しい発注書を作成する関数
export const createOrder = async (data: OrderFormData) => {
  try {
    const response = await instance.post('/orders', data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, '発注書の作成');
  }
};

// 既存の発注書を更新する関数
export const updateOrder = async (id: number, data: OrderFormData) => {
  try {
    const response = await instance.put(`/orders/${id}`, data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, `ID ${id} の発注書の更新`);
  }
};

// 発注書を削除する関数
export const deleteOrder = async (id: number) => {
  try {
    const response = await instance.delete(`/orders/${id}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, `ID ${id} の発注書の削除`);
  }
};

// 発注書番号の一意性をチェックする関数
export const checkUniqueOrderNumber = async (orderNumber: string): Promise<boolean> => {
  try {
    const response = await instance.get(`/orders/check-unique?orderNumber=${orderNumber}`);
    return response.data.isUnique;
  } catch (error: any) {
    return handleApiError(error, '発注書番号の一意性チェック');
  }
};

// 請求書一覧を取得する関数
export const fetchInvoices = async () => {
  try {
    const response = await instance.get('/invoices');
    return response.data;
  } catch (error: any) {
    handleApiError(error, '請求書一覧の取得');
  }
};

// 特定の請求書を取得する関数
export const fetchInvoice = async (id: number) => {
  try {
    const response = await instance.get(`/invoices/${id}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, `ID ${id} の請求書の取得`);
  }
};

// 新しい請求書を作成する関数
export const createInvoice = async (data: InvoiceFormData) => {
  try {
    const response = await instance.post('/invoices', data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, '請求書の作成');
  }
};

// 既存の請求書を更新する関数
export const updateInvoice = async (id: number, data: InvoiceFormData) => {
  try {
    const response = await instance.put(`/invoices/${id}`, data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, `ID ${id} の請求書の更新`);
  }
};

// 請求書を削除する関数
export const deleteInvoice = async (id: number) => {
  try {
    const response = await instance.delete(`/invoices/${id}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, `ID ${id} の請求書の削除`);
  }
};