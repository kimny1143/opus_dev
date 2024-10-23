
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { JsonWebTokenError } from 'jsonwebtoken';

// 請求書一覧取得
export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const invoiceList = await prisma.invoice.findMany({
      include: {
        order: {
          include: {
            client: true,
            items: true,
          },
        },
        items: true,
        issuerUser: true,
        issuerClient: true,
        recipientUser: true,
        recipientClient: true,
      },
      orderBy: {
        issueDate: 'desc',
      },
    });
    return NextResponse.json(invoiceList, { status: 200 });
  } catch (error) {
    console.error('請求書取得エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: '請求書の取得に失敗しました。' }, { status: 500 });
  }
}

// 請求書作成
export async function POST(req: NextRequest) {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
    }
  
    try {
      const user = await verifyToken(token);
      const data = await req.json();
  
      const {
        orderId,
        issueDate,
        dueDate,
        status,
        items,
        direction = 'client_to_user', // デフォルトを設定
      } = data;
  
      // 必須項目のチェック
      if (!orderId || !issueDate || !dueDate || !status || !items) {
        return NextResponse.json({ error: 'すべての必須フィールドを入力してください。' }, { status: 400 });
      }
  
      // 発行日と支払期日の整合性チェック
      const issueDateObj = new Date(issueDate);
      const dueDateObj = new Date(dueDate);
      if (dueDateObj <= issueDateObj) {
        return NextResponse.json({ error: '支払期日は発行日より後の日付を指定してください。' }, { status: 400 });
      }
  
      // 数値フィールドのバリデーション
      for (const item of items) {
        if (!item.description) {
          return NextResponse.json({ error: 'アイテムの説明を入力してください。' }, { status: 400 });
        }
        if (typeof item.quantity !== 'number' || item.quantity < 1) {
          return NextResponse.json({ error: '数量は1以上の数値でなければなりません。' }, { status: 400 });
        }
        if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
          return NextResponse.json({ error: '単価は0以上の数値でなければなりません。' }, { status: 400 });
        }
      }
  
      // 発行者と受領者の決定
      let issuerUserId = null;
      let issuerClientId = null;
      let recipientUserId = null;
      let recipientClientId = null;
  
      // Order の存在確認
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { client: true },
      });
  
      if (!order || !order.client) {
        return NextResponse.json({ error: '関連する注文またはクライアントが見つかりません。' }, { status: 400 });
      }
  
      if (direction === 'client_to_user') {
        // Client から User への請求書発行
        issuerClientId = order.client.id;
        recipientUserId = user.id;
      } else if (direction === 'user_to_client') {
        // User から Client への請求書発行
        issuerUserId = user.id;
        recipientClientId = order.client.id;
      } else {
        return NextResponse.json({ error: '無効な方向性が指定されました。' }, { status: 400 });
      }
  
      // 請求書番号の自動生成
      const timestamp = Date.now();
      const generatedInvoiceNumber = `INV-${timestamp}`;
  
      // invoiceNumber の一意性チェック
      const existingInvoice = await prisma.invoice.findUnique({
        where: { invoiceNumber: generatedInvoiceNumber },
      });
      if (existingInvoice) {
        return NextResponse.json({ error: 'この請求書番号は既に存在します。' }, { status: 400 });
      }
  
      // totalAmount の計算
      const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  
      // アイテムのパース
      const parsedItems = items.map((item: any) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.quantity) * Number(item.unitPrice),
      }));
  
      // 請求書の作成
      const newInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber: generatedInvoiceNumber,
          orderId,
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          status,
          totalAmount,
          issuerUserId,
          issuerClientId,
          recipientUserId,
          recipientClientId,
          items: {
            create: parsedItems,
          },
        },
        include: {
          items: true,
          issuerUser: true,
          issuerClient: true,
          recipientUser: true,
          recipientClient: true,
        },
      });
  
      return NextResponse.json(newInvoice, { status: 201 });
    } catch (error) {
      console.error('請求書作成エラー:', error);
      return NextResponse.json({ error: '請求書の作成に失敗しました。' }, { status: 500 });
    }
  }