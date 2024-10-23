
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { JsonWebTokenError } from 'jsonwebtoken';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const { id } = params;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: '有効な数値IDを提供してください。' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: '発注書が見つかりません。' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('発注書取得エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: '発注書の取得に失敗しました。' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const { id } = params;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: '有効な数値IDを提供してください。' }, { status: 400 });
    }

    const data = await req.json();
    const { orderNumber, clientId, issueDate, dueDate, status, items } = data;

    // 必須項目のチェック
    if (!orderNumber || !clientId || !issueDate || !dueDate || !status || !items) {
      return NextResponse.json({ error: 'すべての必須フィールドを入力してください。' }, { status: 400 });
    }

    // 発注番号の一意性チェック（更新時は自身を除く）
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
    });
    if (existingOrder && existingOrder.id !== orderId) {
      return NextResponse.json({ error: 'この発注番号は既に存在します。' }, { status: 400 });
    }

    // 発注書の更新
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderNumber,
        clientId,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        status,
        items: {
          deleteMany: {}, // 既存のアイテムを削除
          create: items.map((item: any) => ({
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

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('発注書更新エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: '発注書の更新に失敗しました。' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const { id } = params;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: '有効な数値IDを提供してください。' }, { status: 400 });
    }

    // 発注書の削除
    const deletedOrder = await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ message: '発注書が削除されました。' }, { status: 200 });
  } catch (error) {
    console.error('発注書削除エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: '発注書の削除に失敗しました。' }, { status: 500 });
  }
}