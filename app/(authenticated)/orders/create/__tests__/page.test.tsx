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

describe('CreateInvoicePage', () => {
  const mockPush = jest.fn();
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    // useRouterのモック設定
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

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

    // axiosのモックインスタンスを作成
    const mockedAxiosInstance = {
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
      get: jest.fn().mockImplementation((url: string) => {
        if (url === '/api/clients') {
          return Promise.resolve({ data: mockClients });
        }
        if (url === '/api/orders') {
          return Promise.resolve({ data: mockOrders });
        }
        return Promise.resolve({ data: [] });
      }),
      post: jest.fn().mockResolvedValue({ data: { id: 1 } }),
      // 他の必要なメソッドをモック
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

    // axios.create がモックインスタンスを返すよう設定
    (mockedAxios.create as jest.Mock).mockReturnValue(mockedAxiosInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('フォームが正しくレンダリングされる', async () => {
    render(<CreateInvoicePage />);

    // クライアントとオーダーのデータが読み込まれるのを待つ
    await waitFor(() => expect(screen.getByLabelText('請求書番号')).toBeInTheDocument());

    // フォームフィールドの存在を確認
    expect(screen.getByLabelText('請求書番号')).toBeInTheDocument();
    expect(screen.getByLabelText('発注書番号')).toBeInTheDocument();
    expect(screen.getByLabelText('発行日')).toBeInTheDocument();
    expect(screen.getByLabelText('支払期日')).toBeInTheDocument();
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('アイテム追加')).toBeInTheDocument();
    expect(screen.getByText('作成する')).toBeInTheDocument();
  });

  // 他のテストケースをここに追加...
});