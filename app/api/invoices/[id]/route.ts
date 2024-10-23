
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { JsonWebTokenError } from 'jsonwebtoken';

// 請求書の詳細取得
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
  } catch (error) {
    return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: '有効なIDを提供してください。' }, { status: 400 });
  }

  const invoiceId = Number(id);
  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: '有効な数値IDを提供してください。' }, { status: 400 });
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        issuerUser: true,
        issuerClient: true,
        recipientUser: true,
        recipientClient: true,
        order: {
          include: {
            client: true,
            items: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: '請求書が見つかりません。' }, { status: 404 });
    }

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error('請求書取得エラー:', error);
    return NextResponse.json({ error: '請求書の取得に失敗しました。' }, { status: 500 });
  }
}

// 請求書の更新
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const { id } = params;
    const invoiceId = Number(id);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: '有効な数値IDを提供してください。' }, { status: 400 });
    }

    const data = await req.json();
    const { issueDate, dueDate, status, items } = data;

    // 必須項目のチェック
    if (!issueDate || !dueDate || !status || !items) {
      return NextResponse.json({ error: 'すべての必須フィールドを入力してください。' }, { status: 400 });
    }

    // 請求書の存在確認
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { order: { include: { client: true } }, items: true },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: '請求書が見つかりません。' }, { status: 404 });
    }

    // 関連する注文とクライアントの確認
    if (!existingInvoice.order || !existingInvoice.order.client || !existingInvoice.order.client.registrationNumber) {
      return NextResponse.json({ error: '関連するクライアントの登録番号が見つかりません。' }, { status: 400 });
    }

    // 請求書番号の再生成（必要に応じて）
    // 既に一意の invoiceNumber がある場合、再生成しない場合は下記をコメントアウト
    // const generatedInvoiceNumber = `${existingInvoice.order.client.registrationNumber}-${Date.now()}`;

    // totalAmount の計算
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

    const parsedItems = items.map((item: any) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));

    // 請求書の更新
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        // invoiceNumber を更新する場合は以下を有効にしてください
        // invoiceNumber: generatedInvoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        status,
        totalAmount,
        items: {
          deleteMany: {}, // 既存のアイテムを削除
          create: parsedItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        order: {
          include: {
            client: true,
            items: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    console.error('請求書更新エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: '請求書の更新に失敗しました。' }, { status: 500 });
  }
}

// 請求書の削除
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const { id } = params;
    const invoiceId = Number(id);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: '有効な数値IDを提供してください。' }, { status: 400 });
    }

    // 請求書の存在確認
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: '請求書が見つかりません。' }, { status: 404 });
    }

    // 請求書の削除
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return NextResponse.json({ message: '請求書が正常に削除されました。' }, { status: 200 });
  } catch (error) {
    console.error('請求書削除エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: '請求書の削除に失敗しました。' }, { status: 500 });
  }
}