
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { JsonWebTokenError } from 'jsonwebtoken';
import { isValidDate, isIssueDateValid, isDueDateValid, isPositiveNumber } from '@/lib/validation';
import { appHandler } from '@/lib/appHandler';

// 請求書一覧取得
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
    const invoiceList = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        issueDate: true,
        dueDate: true,
        status: true,
        totalAmount: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            client: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
              }
            }
          }
        },
        items: {
          select: {
            description: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          }
        },
        issuerUser: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          }
        },
        issuerClient: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          }
        },
        recipientUser: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          }
        },
        recipientClient: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          }
        }
      },
      orderBy: {
        issueDate: 'desc',
      },
    });
    return NextResponse.json({ success: true, data: invoiceList }, { status: 200 });
  } catch (error) {
    console.error('請求書取得エラー:', error);
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
        message: '請求書の取得に失敗しました。'
      }
    }, { status: 500 });
  }
}

// 請求書作成
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
      const user = await verifyToken(token);
      const data = await req.json();
  
      const {
        orderId,
        issueDate,
        dueDate,
        status,
        items,
        direction = 'client_to_user',
      } = data;
  
      // 必須項目のチェック
      if (!orderId || !issueDate || !dueDate || !status || !items) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'すべての必須フィールドを入力してください。'
          }
        }, { status: 400 });
      }
  
      // 発行日と支払期日のバリデーション
      if (!isValidDate(issueDate) || !isIssueDateValid(issueDate)) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_ISSUE_DATE',
            message: '有効な発行日を入力してください。'
          }
        }, { status: 400 });
      }
      if (!isValidDate(dueDate) || !isDueDateValid(issueDate, dueDate)) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_DUE_DATE',
            message: '支払期日は発行日より後の日付を入力してください。'
          }
        }, { status: 400 });
      }
  
      // 数値フィールドのバリデーション
      for (const item of items) {
        if (!item.description || item.description.trim() === '') {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INVALID_ITEM_DESCRIPTION',
              message: 'アイテムの説明を入力してください。'
            }
          }, { status: 400 });
        }
        if (!isPositiveNumber(item.quantity)) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INVALID_ITEM_QUANTITY',
              message: '数量は1以上の数値を入力してください。'
            }
          }, { status: 400 });
        }
        if (!isPositiveNumber(item.unitPrice)) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INVALID_ITEM_PRICE',
              message: '単価は0以上の数値を入力してください。'
            }
          }, { status: 400 });
        }
      }


      let issuerUserId = null;
      let issuerClientId = null;
      let recipientUserId = null;
      let recipientClientId = null;
  
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          client: {
            select: {
              id: true,
              companyName: true,
            }
          }
        }
      });
  
      if (!order || !order.client) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: '関連する注文またはクライアントが見つかりません。'
          }
        }, { status: 400 });
      }
  
      if (direction === 'client_to_user') {
        issuerClientId = order.client.id;
        recipientUserId = user.id;
      } else if (direction === 'user_to_client') {
        issuerUserId = user.id;
        recipientClientId = order.client.id;
      } else {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_DIRECTION',
            message: '無効な方向性が指定されました。'
          }
        }, { status: 400 });
      }
  
      const timestamp = Date.now();
      const generatedInvoiceNumber = `INV-${timestamp}`;
  
      const existingInvoice = await prisma.invoice.findUnique({
        where: { invoiceNumber: generatedInvoiceNumber },
        select: { id: true }
      });
      if (existingInvoice) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'DUPLICATE_INVOICE_NUMBER',
            message: 'この請求書番号は既に存在します。'
          }
        }, { status: 400 });
      }
  
      const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  
      const parsedItems = items.map((item: any) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.quantity) * Number(item.unitPrice),
      }));
  
      const newInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber: generatedInvoiceNumber,
          orderId,
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          status,
          totalAmount,
          issuerUserId,
          issuerClientId,
          recipientUserId,
          recipientClientId,
          items: {
            create: parsedItems,
          },
        },
        select: {
          id: true,
          invoiceNumber: true,
          issueDate: true,
          dueDate: true,
          status: true,
          totalAmount: true,
          items: {
            select: {
              description: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            }
          },
          issuerUser: {
            select: {
              name: true,
              email: true,
              companyName: true,
            }
          },
          issuerClient: {
            select: {
              companyName: true,
              contactName: true,
            }
          },
          recipientUser: {
            select: {
              name: true,
              email: true,
              companyName: true,
            }
          },
          recipientClient: {
            select: {
              companyName: true,
              contactName: true,
            }
          }
        }
      });
  
      return NextResponse.json({ success: true, data: newInvoice }, { status: 201 });
    } catch (error) {
      console.error('請求書作成エラー:', error);
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '請求書の作成に失敗しました。'
        }
      }, { status: 500 });
    }
  }