// app/api/clients/[id]/invoices/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { JsonWebTokenError } from 'jsonwebtoken';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // 認証トークンの検証
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

  const clientId = Number(id);
  if (isNaN(clientId)) {
    return NextResponse.json({ error: '有効な数値IDを提供してください。' }, { status: 400 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { clientId: clientId },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('注文取得エラー:', error);
    return NextResponse.json({ error: '注文の取得に失敗しました。' }, { status: 500 });
  }
}