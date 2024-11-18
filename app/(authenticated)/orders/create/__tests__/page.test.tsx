// opus_dev/app/(authenticated)/orders/create/__tests__/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateOrderPage from '../page';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// jest-domをインポート
import '@testing-library/jest-dom';

// axiosとuseRouterをモック化
jest.mock('axios');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('CreateOrderPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // クライアントデータのモック
    const mockClients = [
      {
        id: 1,
        companyName: 'クライアントA',
        address: '住所A',
        contactName: '担当者A',
        contactEmail: 'clientA@example.com',
        contactPhone: '090-1234-5678',
      },
    ];

    // axios.get のモック実装
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/clients') {
        return Promise.resolve({ data: mockClients });
      }
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('フォームが正しくレンダリングされる', async () => {
    render(<CreateOrderPage />);
    
    // クライアントデータの読み込みを待つ
    await waitFor(() => expect(screen.getByLabelText('クライアント')).toBeInTheDocument());

    // フォームフィールドの存在を確認
    expect(screen.getByLabelText('発注番号')).toBeInTheDocument();
    expect(screen.getByLabelText('発行日')).toBeInTheDocument();
    expect(screen.getByLabelText('支払期限')).toBeInTheDocument();
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('アイテムを追加')).toBeInTheDocument();
    expect(screen.getByText('送信')).toBeInTheDocument();
  });

  test('必須フィールド未入力時にエラーメッセージが表示される', async () => {
    render(<CreateOrderPage />);

    // データの読み込みを待つ
    await waitFor(() => expect(screen.getByLabelText('発注番号')).toBeInTheDocument());

    // 送信ボタンをクリック
    fireEvent.click(screen.getByText('作成する'));

    // エラーメッセージの表示を確認
    expect(await screen.findByText('発行日は有効な発行日を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('支払期限は有効な支払期限を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('少なくとも1つのアイテムが必要です。')).toBeInTheDocument();
  });

  test('正しい入力でAPIが呼び出され、ナビゲーションが行われる', async () => {
    // axios.post のモック実装
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        id: 1,
      },
    });

    render(<CreateOrderPage />);

    // データの読み込みを待つ
    await waitFor(() => expect(screen.getByLabelText('発注番号')).toBeInTheDocument());

    // フォームに入力
    fireEvent.change(screen.getByLabelText('発注番号'), { target: { value: 'ORD-002' } });
    fireEvent.change(screen.getByLabelText('クライアント'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('発行日'), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText('支払期限'), { target: { value: '2023-02-01' } });
    fireEvent.change(screen.getByLabelText('ステータス'), { target: { value: 'pending' } });

    // アイテムの入力
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: '商品A' } });
    fireEvent.change(screen.getByLabelText('数量'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('単価'), { target: { value: '1000' } });

    // 送信ボタンをクリック
    fireEvent.click(screen.getByText('作成する'));

    // axios.post が正しく呼び出されたか確認
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/orders', {
        orderNumber: 'ORD-002',
        clientId: 1,
        issueDate: '2023-01-01',
        dueDate: '2023-02-01',
        status: 'pending',
        items: [
          {
            description: '商品A',
            quantity: 1,
            unitPrice: 1000,
          },
        ],
      });
    });

    // ナビゲーションが行われたか確認
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/orders/1');
    });
  });

  test('APIエラー時にエラーメッセージが表示される', async () => {
    // axios.post のモック実装
    (axios.post as jest.Mock).mockRejectedValue({
      response: {
        data: {
          error: '注文の作成に失敗しました。',
        },
      },
    });

    // モック化されたalertを定義
    window.alert = jest.fn();

    render(<CreateOrderPage />);

    // データの読み込みを待つ
    await waitFor(() => expect(screen.getByLabelText('発注番号')).toBeInTheDocument());

    // フォームに入力
    fireEvent.change(screen.getByLabelText('発注番号'), { target: { value: 'ORD-003' } });
    fireEvent.change(screen.getByLabelText('クライアント'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('発行日'), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText('支払期限'), { target: { value: '2023-02-01' } });
    fireEvent.change(screen.getByLabelText('ステータス'), { target: { value: 'pending' } });

    // アイテムの入力
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: '商品B' } });
    fireEvent.change(screen.getByLabelText('数量'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('単価'), { target: { value: '2000' } });

    // 送信ボタンをクリック
    fireEvent.click(screen.getByText('作成する'));

    // エラーメッセージの表示を確認
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('注文の作成に失敗しました。');
    });
  });
});