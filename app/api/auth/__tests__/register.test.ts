import { POST } from '../register/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

describe('Auth API - Register', () => {
  afterAll(async () => {
    // データベースのクリーンアップ
    await prisma.user.deleteMany({});
  });

  test('新規ユーザーを正常に登録できる', async () => {
    const body = {
      name: '新規ユーザー',
      email: 'newuser@example.com', 
      password: 'password123',
      companyName: '新規会社',
      address: '新規住所',
      phone: '03-9876-5432',
      registrationNumber: 'NEW123456',
    };

    const request = {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'content-type') return 'application/json';
          return null;
        },
      },
      json: async () => body,
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('message', '登録成功');
    expect(data).toHaveProperty('user');
    expect(data.user).toMatchObject({
      name: body.name,
      email: body.email,
      companyName: body.companyName,
      address: body.address,
      phone: body.phone,
      registrationNumber: body.registrationNumber
    });
  });

  test('必須フィールドが欠けている場合はエラーを返す', async () => {
    const body = {
      name: '新規ユーザー',
      email: 'newuser@example.com',
      // passwordを省略
      companyName: '新規会社',
      address: '新規住所',
      phone: '03-9876-5432',
      registrationNumber: 'NEW123456',
    };

    const request = {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'content-type') return 'application/json';
          return null;
        },
      },
      json: async () => body,
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error', '必須フィールドが不足しています。');
  });

  test('無効なメールアドレスの場合はエラーを返す', async () => {
    const body = {
      name: '新規ユーザー',
      email: 'invalid-email',
      password: 'password123',
      companyName: '新規会社',
      address: '新規住所', 
      phone: '03-9876-5432',
      registrationNumber: 'NEW123456',
    };

    const request = {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'content-type') return 'application/json';
          return null;
        },
      },
      json: async () => body,
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error', '有効なメールアドレスを入力してください。');
  });

  test('既存のメールアドレスの場合はエラーを返す', async () => {
    // 最初のユーザーを作成
    const existingUser = await prisma.user.create({
      data: {
        name: '既存ユーザー',
        email: 'existing@example.com',
        password: 'hashedpassword',
        companyName: '既存会社',
        address: '既存住所',
        phone: '03-1234-5678',
        registrationNumber: 'EXISTING123'
      }
    });

    const body = {
      name: '新規ユーザー',
      email: 'existing@example.com', // 既存のメールアドレスを使用
      password: 'password123',
      companyName: '新規会社',
      address: '新規住所',
      phone: '03-9876-5432',
      registrationNumber: 'NEW123456',
    };

    const request = {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'content-type') return 'application/json';
          return null;
        },
      },
      json: async () => body,
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error', 'このメールアドレスは既に登録されています。');
  });
});