import { POST } from '../login/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

describe('Auth API - Login', () => {
  let testUser: any;

  beforeAll(async () => {
    try {
      // テスト用ユーザーの作成
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = await prisma.user.create({
        data: {
          name: 'テストユーザー',
          email: 'testuser@example.com',
          password: hashedPassword,
          companyName: 'テスト会社',
          address: 'テスト住所',
          phone: '03-1234-5678',
          registrationNumber: 'TEST123456',
        },
      });
    } catch (error) {
      console.error('beforeAll 内でエラーが発生しました:', error);
      throw error; // エラーを投げてテストを中断
    }
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await prisma.user.deleteMany({});
  });

  test('正しい資格情報でログインできる', async () => {
    const body = {
      email: 'testuser@example.com',
      password: 'password123',
    };

    // リクエストオブジェクトをモック
    const request = {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'content-type') return 'application/json';
          return null;
        },
      },
      json: async () => body,
    } as unknown as NextRequest;

    // API ハンドラーを呼び出し
    const response = await POST(request);

    // ステータスコードの検証
    expect(response.status).toBe(200);

    // レスポンスボディの検証
    const data = await response.json();

    expect(data).toHaveProperty('message', 'ログイン成功');
    expect(data).toHaveProperty('user');
    expect(data.user).toHaveProperty('id', testUser.id);
    expect(data.user).toHaveProperty('email', 'testuser@example.com');
    expect(data).toHaveProperty('accessToken');
  });
});