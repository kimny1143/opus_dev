import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import { appHandler } from '@/lib/appHandler';
import prisma from '@/lib/prisma';
import { generateTokens } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// jest-domをインポート
import '@testing-library/jest-dom';

describe('Auth API - Login', () => {
  let server: any;
  let testUser: any;
  let token: string;

  beforeAll(async () => {
    // テストユーザーの作成（パスワードはハッシュ化）
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

    // テスト用サーバーのセットアップ
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url || '', true);
      appHandler(req as any, res, parsedUrl);
    });
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    server.close();
  });

  test('正しい資格情報でログインできる', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'ログイン成功');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'testuser@example.com');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('存在しないユーザーでログインを試みる', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'ユーザーが存在しません。');
  });

  test('誤ったパスワードでログインを試みる', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'パスワードが正しくありません。');
  });

  test('トークンの有効期限が切れている場合の処理', async () => {
    // トークンの有効期限を短く設定したユーザーを作成
    const shortExpiryUser = await prisma.user.create({
      data: {
        name: '期限切れユーザー',
        email: 'expireduser@example.com',
        password: await bcrypt.hash('password123', 10),
        companyName: '期限切れ会社',
        address: '期限切れ住所',
        phone: '03-0000-0000',
        registrationNumber: 'EXPIRED123',
      },
    });

    // トークンを生成（有効期限を1秒に設定）
    const expiredTokens = jwt.sign(
      { userId: shortExpiryUser.id, email: shortExpiryUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1s' }
    );

    // 少し待ってトークンを期限切れにする
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 期限切れトークンで保護されたエンドポイントにアクセス
    const response = await request(server)
      .get('/api/protected')
      .set('Authorization', `Bearer ${expiredTokens}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'トークンの有効期限が切れています。');
  });

  test('リフレッシュトークンで新しいアクセストークンを取得できる', async () => {
    // ログインしてリフレッシュトークンを取得
    const loginResponse = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });

    expect(loginResponse.status).toBe(200);
    const cookiesHeader = loginResponse.headers['set-cookie'];
    if (!cookiesHeader || !Array.isArray(cookiesHeader)) {
      throw new Error('Cookies not found in response');
    }
    expect(cookiesHeader).toBeDefined();

    // リフレッシュトークンを取得
    const refreshTokenCookie = cookiesHeader.find((cookie: string) =>
      cookie.startsWith('refreshToken=')
    );
    if (!refreshTokenCookie) {
      throw new Error('Refresh token not found in cookies');
    }
    const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

    // リフレッシュトークンを使用して新しいアクセストークンを取得
    const refreshResponse = await request(server)
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty('accessToken');
  });
});