// app/api/clients/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { JsonWebTokenError } from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const clients = await prisma.client.findMany({
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    console.error('取引先取得エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: '取引先の取得に失敗しました。' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const body = await req.json();
    const { companyName, address, contactName, contactEmail, contactPhone, registrationNumber, categoryId, tags } = body;

    // バリデーションを追加することをお勧めします

    const newClient = await prisma.client.create({
      data: {
        companyName,
        address,
        contactName,
        contactEmail,
        contactPhone,
        registrationNumber,
        categoryId,
        tags: {
          connect: tags.map((tagId: number) => ({ id: tagId })),
        },
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('取引先作成エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: '取引先の作成に失敗しました。' }, { status: 500 });
  }
}