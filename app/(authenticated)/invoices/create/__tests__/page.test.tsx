 // Start of Selection
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateInvoicePage from '../page';
import axios, { AxiosInstance } from 'axios';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

// axiosとuseRouterをモック化
jest.mock('axios');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('CreateInvoicePage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // モックされた axios インスタンスを作成
    const mockedAxiosInstance = {
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      delete: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      postForm: jest.fn(),
      putForm: jest.fn(),
      patchForm: jest.fn(),
      getUri: jest.fn(),
      defaults: {
        headers: {
          common: {},
          delete: {},
          get: {},
          head: {},
          post: {},
          put: {},
          patch: {},
        },
        transformRequest: [],
        transformResponse: [],
      },
    } as unknown as jest.Mocked<AxiosInstance>;

    // クライアントとオーダーデータのモック
    const mockClients = [
      {
        id: 1,
        companyName: 'テストクライアント',
        address: 'テスト住所',
        contactName: 'テスト担当者',
        contactEmail: 'test@example.com',
        contactPhone: '03-1234-5678',
      },
    ];

    const mockOrders = [
      {
        id: 1,
        orderNumber: 'ORD-001',
        clientId: 1,
        status: 'approved',
      },
    ];

    // GET メソッドのモック設定
    mockedAxiosInstance.get.mockImplementation((url: string) => {
      if (url === '/api/clients') {
        return Promise.resolve({ data: mockClients });
      }
      if (url === '/api/orders') {
        return Promise.resolve({ data: mockOrders });
      }
      return Promise.resolve({ data: [] });
    });

    // POST メソッドのモック設定
    mockedAxiosInstance.post.mockResolvedValue({ data: { id: 1 } });

    // axios.create がモックインスタンスを返すように設定
    (mockAxios.create as jest.Mock).mockReturnValue(mockedAxiosInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // テストケース...
});