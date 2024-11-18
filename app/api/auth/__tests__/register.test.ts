import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import { appHandler } from '@/lib/appHandler';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// jest-domをインポート
import '@testing-library/jest-dom';

describe('Auth API - Register', () => {
  let server: any;

  beforeAll(async () => {
    // テスト用サーバーのセットアップ
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url || '', true);
      appHandler(req as any, res, parsedUrl);
    });
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'newuser@example.com',
            'testuser@example.com',
          ],
        },
      },
    });
    await prisma.$disconnect();
    server.close();
  });

  test('正しいデータでユーザー登録ができる', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({
        name: '新規ユーザー',
        email: 'newuser@example.com',
        password: 'newpassword123',
        companyName: '新規会社',
        address: '新規住所',
        phone: '03-9999-8888',
        registrationNumber: 'NEW123456',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'ユーザー登録が成功しました。');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'newuser@example.com');

    // データベースにユーザーが存在することを確認
    const user = await prisma.user.findUnique({
      where: { email: 'newuser@example.com' },
    });
    expect(user).not.toBeNull();
    expect(user?.name).toBe('新規ユーザー');
  });

  test('既に存在するメールアドレスで登録を試みる', async () => {
    // 事前にユーザーを作成
    const existingUser = await prisma.user.create({
      data: {
        name: '既存ユーザー',
        email: 'testuser@example.com',
        password: await bcrypt.hash('password123', 10),
        companyName: '既存会社',
        address: '既存住所',
        phone: '03-1111-2222',
        registrationNumber: 'EXIST123456',
      },
    });

    const response = await request(server)
      .post('/api/auth/register')
      .send({
        name: '重複ユーザー',
        email: 'testuser@example.com', // 既存のメールアドレス
        password: 'anotherpassword123',
        companyName: '重複会社',
        address: '重複住所',
        phone: '03-3333-4444',
        registrationNumber: 'DUPLICATE123456',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', '既に存在するメールアドレスです。');
  });

  test('必須フィールドが欠落している場合にエラーを返す', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({
        // name フィールドが欠落
        email: 'incomplete@example.com',
        password: 'password123',
        companyName: '不完全会社',
        address: '不完全住所',
        phone: '03-5555-6666',
        registrationNumber: 'INCOMPLETE123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'すべての必須フィールドを入力してください。');
  });

  test('無効なメールアドレス形式で登録を試みる', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({
        name: '無効メールユーザー',
        email: 'invalid-email',
        password: 'password123',
        companyName: '無効メール会社',
        address: '無効メール住所',
        phone: '03-7777-8888',
        registrationNumber: 'INVALID123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', '有効なメールアドレスを入力してください。');
  });
});