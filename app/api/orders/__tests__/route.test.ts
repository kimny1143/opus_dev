import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';

import prisma from '@/lib/prisma';
import { generateTokens } from '@/lib/auth';
import { appHandler } from '@/lib/appHandler';
// jest-domをインポート
import '@testing-library/jest-dom';

// テスト用サーバーのセットアップ
const server = createServer((req, res) => {
  const parsedUrl = parse(req.url || '', true);
  appHandler(req as any, res, parsedUrl);
});

describe('Orders API', () => {
  let token: string;
  let testUser: any;
  let testClient: any;
  let testOrder: any;

  beforeAll(async () => {
    // テストユーザーの作成
    testUser = await prisma.user.create({
      data: {
        name: 'テストユーザー',
        email: 'testuser@example.com',
        password: 'hashedpassword', // パスワードはハッシュ化されている前提
        companyName: 'テスト会社',
        address: 'テスト住所',
        phone: '03-1234-5678',
        registrationNumber: 'TEST123456',
      },
    });

    // 認証トークンの生成
    const tokens = generateTokens(testUser);
    token = tokens.accessToken;

    // テストクライアントの作成
    testClient = await prisma.client.create({
      data: {
        companyName: 'テストクライアント株式会社',
        address: '東京都テスト区テスト町1-2-3',
        contactName: '山田 太郎',
        contactEmail: 'client@example.com',
        contactPhone: '090-1234-5678',
        hasInvoiceRegistration: true,
        registrationNumber: 'CLIENT123456',
        status: 'active',
      },
    });
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await prisma.invoice.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    server.close();
  });

  describe('POST /api/orders', () => {
    test('正常な注文作成', async () => {
      const response = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderNumber: 'ORD-TEST-001',
          clientId: testClient.id,
          issueDate: '2023-01-01',
          dueDate: '2023-02-01',
          status: 'pending',
          items: [
            {
              description: '商品A',
              quantity: 1,
              unitPrice: 1000,
              totalPrice: 1000,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('orderNumber', 'ORD-TEST-001');
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0]).toHaveProperty('description', '商品A');
    });

    test('発注番号が重複している場合にエラーを返す', async () => {
      const duplicateOrderNumber = 'ORD-TEST-002';

      // 既存の注文を作成
      await prisma.order.create({
        data: {
          orderNumber: duplicateOrderNumber,
          clientId: testClient.id,
          issueDate: new Date('2023-01-01'),
          dueDate: new Date('2023-02-01'),
          status: 'pending',
          totalAmount: 2000,
          items: {
            create: [
              {
                description: '商品B',
                quantity: 2,
                unitPrice: 1000,
                totalPrice: 2000,
              },
            ],
          },
        },
      });

      // 同じ発注番号で再度作成を試みる
      const response = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderNumber: duplicateOrderNumber,
          clientId: testClient.id,
          issueDate: '2023-01-02',
          dueDate: '2023-02-02',
          status: 'pending',
          items: [
            {
              description: '商品C',
              quantity: 1,
              unitPrice: 1000,
              totalPrice: 1000,
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'DUPLICATE_ORDER_NUMBER',
        message: 'この発注番号は既に存在します。',
      });
    });

    test('無効な日付形式の場合にエラーを返す', async () => {
      const response = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderNumber: 'ORD-TEST-003',
          clientId: testClient.id,
          issueDate: 'invalid-date',
          dueDate: '2023-02-01',
          status: 'pending',
          items: [
            {
              description: '商品D',
              quantity: 1,
              unitPrice: 1000,
              totalPrice: 1000,
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'INVALID_ISSUE_DATE_FORMAT',
        message: '無効な発行日です。',
      });
    });

    test('必須項目が欠落している場合にエラーを返す', async () => {
      const response = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // orderNumber を欠落
          clientId: testClient.id,
          issueDate: '2023-01-01',
          dueDate: '2023-02-01',
          status: 'pending',
          items: [
            {
              description: '商品E',
              quantity: 1,
              unitPrice: 1000,
              totalPrice: 1000,
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'REQUIRED_FIELDS_MISSING',
        message: 'すべての必須フィールドを入力してください。',
      });
    });
  });
});