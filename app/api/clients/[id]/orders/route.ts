import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  // 認証トークンの検証
  let token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    token = req.cookies.get('token')?.value;
  }
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