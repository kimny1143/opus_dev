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

describe('Invoices API', () => {
  let token: string;
  let testUser: any;
  let testOrder: any;

  beforeAll(async () => {
    // テストユーザーの作成
    testUser = await prisma.user.create({
      data: {
        name: 'テストユーザー',
        email: 'testuser@example.com',
        password: 'hashedpassword',
        companyName: 'テスト会社',
        address: 'テスト住所',
        phone: '03-1234-5678',
        registrationNumber: 'TEST123456',
      },
    });

    // 認証トークンの生成
    const tokens = generateTokens(testUser);
    token = tokens.accessToken;

    // テスト用注文の作成
    testOrder = await prisma.order.create({
      data: {
        orderNumber: 'ORD-TEST-001',
        client: {
          create: {
            companyName: 'テストクライアント株式会社',
            address: 'テストクライアント住所',
            contactName: 'テスト担当者',
            contactEmail: 'client@example.com',
            contactPhone: '03-9876-5432',
            hasInvoiceRegistration: true,
            registrationNumber: 'CLIENT123456',
            status: 'active',
          },
        },
        issueDate: new Date('2023-01-01'),
        dueDate: new Date('2023-02-01'),
        status: 'pending',
        totalAmount: 10000,
        items: {
          create: [
            {
              description: 'テスト商品A',
              quantity: 2,
              unitPrice: 5000,
              totalPrice: 10000,
            },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await prisma.invoice.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    server.close();
  });

  describe('POST /api/invoices', () => {
    test('正常な請求書作成', async () => {
      const response = await request(server)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: testOrder.id,
          issueDate: '2023-01-01',
          dueDate: '2023-02-01',
          status: 'unpaid',
          items: [
            {
              description: 'サービス料',
              quantity: 3,
              unitPrice: 10000,
              totalPrice: 30000,
            },
          ],
          invoiceNumber: `INV-${Date.now()}`,
          issuerClientId: testUser.id,
          recipientUserId: testUser.id,
          recipientClientId: testOrder.clientId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('invoiceNumber');
    });

    test('重複する請求書番号の場合、エラーが返される', async () => {
      const generatedInvoiceNumber = `INV-${Date.now()}`;

      // 既存の請求書を作成
      await prisma.invoice.create({
        data: {
          invoiceNumber: generatedInvoiceNumber,
          orderId: testOrder.id,
          issueDate: new Date('2023-01-01'),
          dueDate: new Date('2023-02-01'),
          status: 'unpaid',
          totalAmount: 30000,
          issuerUserId: testUser.id,
          issuerClientId: testUser.id,
          recipientUserId: testUser.id,
          recipientClientId: testOrder.clientId,
          items: {
            create: [
              {
                description: 'サービス料',
                quantity: 3,
                unitPrice: 10000,
                totalPrice: 30000,
              },
            ],
          },
        },
      });

      // 同じ請求書番号で再度作成を試みる
      const response = await request(server)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: testOrder.id,
          issueDate: '2023-01-01',
          dueDate: '2023-02-01',
          status: 'unpaid',
          items: [
            {
              description: 'サービス料',
              quantity: 3,
              unitPrice: 10000,
              totalPrice: 30000,
            },
          ],
          invoiceNumber: generatedInvoiceNumber,
          issuerClientId: testUser.id,
          recipientUserId: testUser.id,
          recipientClientId: testOrder.clientId,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'DUPLICATE_INVOICE_NUMBER',
        message: 'この請求書番号は既に存在します。',
      });
    });
  });
});