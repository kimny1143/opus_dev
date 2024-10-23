import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { JsonWebTokenError } from 'jsonwebtoken';

// 注文一覧取得
export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const orderList = await prisma.order.findMany({
      include: {
        client: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(orderList, { status: 200 });
  } catch (error) {
    console.error('注文取得エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: '注文の取得に失敗しました。' }, { status: 500 });
  }
}

// 注文作成
export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const data = await req.json();

    const {
      orderNumber,
      clientId,
      issueDate,
      dueDate,
      status,
      items,
    } = data;

    // 必須項目のチェック
    if (!orderNumber || !clientId || !issueDate || !dueDate || !status || !items) {
      return NextResponse.json({ error: 'すべての必須フィールドを入力してください。' }, { status: 400 });
    }

    // 発注番号の一意性チェック
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
    });
    if (existingOrder) {
      return NextResponse.json({ error: 'この発注番号は既に存在します。' }, { status: 400 });
    }

    // totalAmount の計算
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

    const parsedItems = items.map((item: any) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));
  
    // 発注書の作成
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        clientId,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        status,
        totalAmount,
        items: {
          create: parsedItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('注文作成エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: '注文の作成に失敗しました。' }, { status: 500 });
  }
}