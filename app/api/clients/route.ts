import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { JsonWebTokenError } from 'jsonwebtoken';
import { CustomFormData } from '@/types/form';

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const clientList = await prisma.client.findMany({
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    return NextResponse.json(clientList, { status: 200 });
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
    const body = await req.json() as CustomFormData;

    // バリデーションとデータ取得
    const {
      companyName,
      address,
      contactName,
      contactEmail,
      contactPhone,
      hasInvoiceRegistration,
      registrationNumber,
      categoryId,
      tagIds,
      status,
    } = body;

    // バリデーション
    if (!companyName) {
      return NextResponse.json({ error: '会社名/氏名は必須です。' }, { status: 400 });
    }

    // バリデーション：カテゴリが個人以外の場合、contactName は必須
    if (categoryId !== 1 && !contactName) {
      return NextResponse.json({ error: '担当者名は必須です。' }, { status: 400 });
    }

    if (hasInvoiceRegistration && !registrationNumber) {
      return NextResponse.json({ error: '登録番号は必須です。' }, { status: 400 });
    }

    const newClient = await prisma.client.create({
      data: {
        companyName: companyName,
        address: address || '',
        contactName: contactName || '',
        contactEmail: contactEmail || '',
        contactPhone: contactPhone || '',
        hasInvoiceRegistration,
        registrationNumber: hasInvoiceRegistration && registrationNumber ? registrationNumber : '',
        categoryId,
        status,
        tags: tagIds && tagIds.length > 0 ? {
          create: tagIds.map((tagId: number) => ({
            tag: { connect: { id: tagId } }
          }))
        } : undefined,
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