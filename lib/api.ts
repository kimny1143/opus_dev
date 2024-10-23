// lib/api.ts

import axios from 'axios';
import { OrderFormData, InvoiceFormData } from '@/lib/types';

// Axiosインスタンスの作成
const instance = axios.create({
  baseURL: '/', // Next.js内からのリクエストの場合、baseURLは不要
  withCredentials: true, // クッキーを含める
});

// リクエストインターセプター
instance.interceptors.request.use(
  (config) => {
    // トークンはhttpOnlyクッキーに保存されているため、クライアント側で直接設定する必要はありません。
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター
instance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default instance;

// 発注書一覧を取得する関数
export const fetchOrders = async () => {
  try {
    const response = await instance.get('/api/orders');
    return response.data;
  } catch (error) {
    console.error('発注書一覧の取得に失敗しました:', error);
    throw error;
  }
};

// 特定の発注書を取得する関数
export const fetchOrder = async (id: number) => {
  try {
    const response = await instance.get(`/api/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`ID ${id} の発注書の取得に失敗しました:`, error);
    throw error;
  }
};

// 新しい発注書を作成する関数
export const createOrder = async (data: OrderFormData) => {
  try {
    const response = await instance.post('/api/orders', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('発注書の作成に失敗しました:', error);
    throw error.response?.data?.error || '発注書の作成に失敗しました。';
  }
};

// 既存の発注書を更新する関数
export const updateOrder = async (id: number, data: OrderFormData) => {
  try {
    const response = await instance.put(`/api/orders/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`ID ${id} の発注書の更新に失敗しました:`, error);
    throw error.response?.data?.error || '発注書の更新に失敗しました。';
  }
};

// 発注書を削除する関数
export const deleteOrder = async (id: number) => {
  try {
    const response = await instance.delete(`/api/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`ID ${id} の発注書の削除に失敗しました:`, error);
    throw error;
  }
};

// 発注書番号の一意性をチェックする関数
export const checkUniqueOrderNumber = async (orderNumber: string): Promise<boolean> => {
  try {
    const response = await instance.get(`/api/orders/check-unique?orderNumber=${orderNumber}`);
    return response.data.isUnique;
  } catch (error) {
    console.error('発注書番号の一意性チェックに失敗しました:', error);
    throw error;
  }
};

// 請求書一覧を取得する関数
export const fetchInvoices = async () => {
  try {
    const response = await instance.get('/api/invoices');
    return response.data;
  } catch (error) {
    console.error('請求書一覧の取得に失敗しました:', error);
    throw error;
  }
};

// 特定の請求書を取得する関数
export const fetchInvoice = async (id: number) => {
  try {
    const response = await instance.get(`/api/invoices/${id}`);
    return response.data;
  } catch (error) {
    console.error(`ID ${id} の請求書の取得に失敗しました:`, error);
    throw error;
  }
};

// 新しい請求書を作成する関数
export const createInvoice = async (data: InvoiceFormData) => {
  try {
    const response = await instance.post('/api/invoices', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('請求書の作成に失敗しました:', error);
    throw error.response?.data?.error || '請求書の作成に失敗しました。';
  }
};

// 既存の請求書を更新する関数
export const updateInvoice = async (id: number, data: InvoiceFormData) => {
  try {
    const response = await instance.put(`/api/invoices/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`ID ${id} の請求書の更新に失敗しました:`, error);
    throw error.response?.data?.error || '請求書の更新に失敗しました。';
  }
};

// 請求書を削除する関数
export const deleteInvoice = async (id: number) => {
  try {
    const response = await instance.delete(`/api/invoices/${id}`);
    return response.data;
  } catch (error) {
    console.error(`ID ${id} の請求書の削除に失敗しました:`, error);
    throw error;
  }
};

// 既存の axios インスタンスとは別に、Authorization ヘッダーを使用する場合
export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);