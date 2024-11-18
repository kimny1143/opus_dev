// opus_dev/app/(authenticated)/invoices/create/__tests__/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateInvoicePage from '../page';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// axiosとuseRouterをモック化
jest.mock('axios');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('CreateInvoicePage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // クライアントとオーダーデータのモック
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

    const mockOrders = [
      {
        id: 1,
        orderNumber: 'ORD-001',
      },
    ];

    // axios.get のモック実装
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/clients') {
        return Promise.resolve({ data: mockClients });
      }
      if (url === '/api/orders') {
        return Promise.resolve({ data: mockOrders });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('フォームが正しくレンダリングされる', async () => {
    render(<CreateInvoicePage />);
    
    // ローディング中の表示を確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

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

  test('バリデーションエラーが適切に表示される', async () => {
    render(<CreateInvoicePage />);

    await waitFor(() => expect(screen.getByLabelText('請求書番号')).toBeInTheDocument());

    // 無効な日付を入力
    fireEvent.change(screen.getByLabelText('発行日'), { target: { value: '2024-13-32' } });
    fireEvent.change(screen.getByLabelText('支払期日'), { target: { value: '2023-00-00' } });
    
    // 無効な数値を入力
    fireEvent.change(screen.getByLabelText('数量'), { target: { value: '-1' } });
    fireEvent.change(screen.getByLabelText('単価'), { target: { value: '0' } });

    // 作成ボタンをクリック
    fireEvent.click(screen.getByText('作成する'));

    // バリデーションエラーメッセージの確認
    expect(await screen.findByText('有効な発行日を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('有効な支払期日を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('数量は1以上の整数を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('単価は1円以上を入力してください。')).toBeInTheDocument();
  });

  test('支払期日が発行日より前の場合にエラーが表示される', async () => {
    render(<CreateInvoicePage />);

    await waitFor(() => expect(screen.getByLabelText('請求書番号')).toBeInTheDocument());

    // 発行日より前の支払期日を設定
    fireEvent.change(screen.getByLabelText('発行日'), { target: { value: '2023-12-01' } });
    fireEvent.change(screen.getByLabelText('支払期日'), { target: { value: '2023-11-30' } });

    fireEvent.click(screen.getByText('作成する'));

    expect(await screen.findByText('支払期日は発行日以降に設定してください。')).toBeInTheDocument();
  });

  test('APIエラーハンドリングが正しく動作する', async () => {
    (axios.post as jest.Mock).mockRejectedValue({
      response: {
        status: 400,
        data: {
          error: '請求書番号が既に存在します。',
          validationErrors: {
            invoiceNumber: '一意の請求書番号を入力してください。',
            items: 'アイテムの合計金額が上限を超えています。'
          }
        }
      }
    });

    render(<CreateInvoicePage />);

    await waitFor(() => expect(screen.getByLabelText('請求書番号')).toBeInTheDocument());

    // 必要な入力を行う
    fireEvent.change(screen.getByLabelText('請求書番号'), { target: { value: 'INV-001' } });
    fireEvent.change(screen.getByLabelText('発注書'), { target: { value: 'ORD-001' } });
    fireEvent.change(screen.getByLabelText('発行日'), { target: { value: '2023-12-01' } });
    fireEvent.change(screen.getByLabelText('支払期日'), { target: { value: '2023-12-31' } });

    // アイテムの追加
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'テストアイテム' } });
    fireEvent.change(screen.getByLabelText('数量'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('単価'), { target: { value: '10000000' } });

    fireEvent.click(screen.getByText('作成する'));

    // APIエラーメッセージの確認
    await waitFor(() => {
      expect(screen.getByText('一意の請求書番号を入力してください。')).toBeInTheDocument();
      expect(screen.getByText('アイテムの合計金額が上限を超えています。')).toBeInTheDocument();
    });
  });

  test('正しい入力でAPIが呼び出され、ナビゲーションが行われる', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        id: 1,
      },
    });

    render(<CreateInvoicePage />);

    await waitFor(() => expect(screen.getByLabelText('請求書番号')).toBeInTheDocument());

    // 正しい入力を行う
    fireEvent.change(screen.getByLabelText('請求書番号'), { target: { value: 'INV-001' } });
    fireEvent.change(screen.getByLabelText('発注書'), { target: { value: 'ORD-001' } });
    fireEvent.change(screen.getByLabelText('発行日'), { target: { value: '2023-12-01' } });
    fireEvent.change(screen.getByLabelText('支払期日'), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByLabelText('ステータス'), { target: { value: 'unpaid' } });

    // アイテムの入力
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'サービス料' } });
    fireEvent.change(screen.getByLabelText('数量'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('単価'), { target: { value: '10000' } });

    fireEvent.click(screen.getByText('作成する'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/invoices', expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/invoices/1');
    });
  });
});