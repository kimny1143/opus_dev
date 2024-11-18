import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { JsonWebTokenError } from 'jsonwebtoken';
import { isValidDate, isIssueDateValid, isDueDateValid, isPositiveNumber } from '@/lib/validation';
import { appHandler } from '@/lib/appHandler';
// 注文一覧取得
export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'AUTH_TOKEN_REQUIRED',
        message: '認証トークンが必要です。'
      }
    }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const orderList = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        issueDate: true,
        dueDate: true,
        status: true,
        totalAmount: true,
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
          }
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ success: true, data: orderList }, { status: 200 });
  } catch (error) {
    console.error('注文取得エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '無効な認証トークンです。'
        }
      }, { status: 401 });
    }
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '注文の取得に失敗しました。'
      }
    }, { status: 500 });
  }
}

// 注文作成
export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'AUTH_TOKEN_REQUIRED',
        message: '認証トークンが必要です。'
      }
    }, { status: 401 });
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
      return NextResponse.json({
        success: false,
        error: {
          code: 'REQUIRED_FIELDS_MISSING',
          message: 'すべての必須フィールドを入力してください。'
        }
      }, { status: 400 });
    }

    // 日付のバリデーション
    if (!isValidDate(issueDate)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_ISSUE_DATE_FORMAT',
          message: '無効な発行日です。'
        }
      }, { status: 400 });
    }

    if (!isValidDate(dueDate)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_DUE_DATE_FORMAT',
          message: '無効な支払期日です。'
        }
      }, { status: 400 });
    }

    if (!isIssueDateValid(issueDate)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_ISSUE_DATE',
          message: '発行日は現在の日付以前である必要があります。'
        }
      }, { status: 400 });
    }

    if (!isDueDateValid(issueDate, dueDate)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_DUE_DATE',
          message: '支払期日は発行日より後である必要があります。'
        }
      }, { status: 400 });
    }

    // アイテムのバリデーション
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ITEMS_REQUIRED',
          message: '少なくとも1つのアイテムが必要です。'
        }
      }, { status: 400 });
    }

    for (const item of items) {
      if (!item.description || !item.quantity || !item.unitPrice) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_ITEM_DATA',
            message: '各アイテムには説明、数量、単価が必要です。'
          }
        }, { status: 400 });
      }

      if (!isPositiveNumber(item.quantity)) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_ITEM_QUANTITY',
            message: '数量は正の数である必要があります。'
          }
        }, { status: 400 });
      }

      if (!isPositiveNumber(item.unitPrice)) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_ITEM_PRICE',
            message: '単価は正の数である必要があります。'
          }
        }, { status: 400 });
      }
    }

    // 発注番号の一意性チェック
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true }
    });
    if (existingOrder) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'DUPLICATE_ORDER_NUMBER',
          message: 'この発注番号は既に存在します。'
        }
      }, { status: 400 });
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
      select: {
        id: true,
        orderNumber: true,
        issueDate: true,
        dueDate: true,
        status: true,
        totalAmount: true,
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          }
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          }
        },
      },
    });

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error) {
    console.error('注文作成エラー:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '無効な認証トークンです。'
        }
      }, { status: 401 });
    }
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '注文の作成に失敗しました。'
      }
    }, { status: 500 });
  }
}
