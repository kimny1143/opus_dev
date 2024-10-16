// app/api/dashboard/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);

    // 必要な統計情報を取得
    const userCount = await prisma.user.count();
    const clientCount = await prisma.client.count();
    // 他の統計情報も必要に応じて追加

    return NextResponse.json({ userCount, clientCount }, { status: 200 });
  } catch (error) {
    console.error('統計情報の取得エラー:', error);
    return NextResponse.json({ error: '統計情報の取得に失敗しました。' }, { status: 500 });
  }
}