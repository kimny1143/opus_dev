import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { JsonWebTokenError } from 'jsonwebtoken';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const { id } = params;
    const clientId = Number(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: '有効な数値IDを提供してください。' }, { status: 400 });
    }

    const data = await req.json();

    // 既存のタグをクリアし、新しいタグを設定
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        companyName: data.categoryId === 1 ? 'none' : data.companyName,
        address: data.address,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        registrationNumber: data.registrationNumber,
        categoryId: data.categoryId,
        tags: {
          deleteMany: {}, // 既存の関連を削除
          create: data.tagIds.map((tagId: number) => ({
            tag: { connect: { id: tagId } },
          })),
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

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error('クライアント更新エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: 'クライアントの更新に失敗しました。' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const { id } = params;
    const clientId = Number(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: '有効な数値IDを提供してください。' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'クライアントが見つかりません。' }, { status: 404 });
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error('クライアント取得エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: 'クライアントの取得に失敗しました。' }, { status: 500 });
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
    const clientId = Number(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: '有効な数値IDを提供してください。' }, { status: 400 });
    }

    // 関連するタグを削除し、その後クライアントを削除
    const deletedClient = await prisma.$transaction(async (prisma) => {
      await prisma.tagsOnClients.deleteMany({
        where: { clientId: clientId },
      });

      return prisma.client.delete({
        where: { id: clientId },
      });
    });

    return NextResponse.json(deletedClient, { status: 200 });
  } catch (error) {
    console.error('クライアント削除エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
    }
    return NextResponse.json({ error: 'クライアントの削除に失敗しました。' }, { status: 500 });
  }
}