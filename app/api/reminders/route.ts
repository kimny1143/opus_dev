import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 支払期限が近い請求書の一覧を取得するエンドポイント
export async function GET(req: NextRequest) {
  const token = getToken(req);

  if (!token) {
    return NextResponse.json(
      { error: '認証トークンが必要です。' },
      { status: 401 }
    );
  }

  try {
    const user = await verifyToken(token);

    // 支払期限が今日から3日以内または過ぎた未払いの請求書を取得
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    const invoices = await prisma.invoice.findMany({
      where: {
        status: '未払い',
        dueDate: {
          lte: threeDaysLater,
        },
      },
      include: {
        recipientClient: true,
        issuerClient: true,
      },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('認証エラー:', error);
    return NextResponse.json(
      { error: '無効な認証トークンです。' },
      { status: 401 }
    );
  }
}

// 特定の請求書に対してリマインダーメールを送信するエンドポイント
export async function POST(req: NextRequest) {
  const token = getToken(req);

  if (!token) {
    return NextResponse.json(
      { error: '認証トークンが必要です。' },
      { status: 401 }
    );
  }

  try {
    const user = await verifyToken(token);
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: '請求書IDが必要です。' },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        recipientClient: true,
        issuerClient: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: '指定された請求書が存在しません。' },
        { status: 404 }
      );
    }

    if (invoice.status !== '未払い') {
      return NextResponse.json(
        { error: 'この請求書は既に支払い済みです。' },
        { status: 400 }
      );
    }

    if (
      !invoice.recipientClient ||
      !invoice.recipientClient.contactEmail
    ) {
      return NextResponse.json(
        { error: '請求書のクライアント情報が不足しています。' },
        { status: 400 }
      );
    }

    const clientEmail = invoice.recipientClient.contactEmail;

    // リマインダーメールの送信
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: clientEmail,
      subject: `リマインダー: 請求書 ${invoice.invoiceNumber} の支払い期限が近づいています`,
      text: `拝啓

請求書番号 ${invoice.invoiceNumber} の支払期限が ${new Date(invoice.dueDate).toLocaleDateString(
        'ja-JP',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )} に迫っています。お支払いのほどよろしくお願いいたします。

よろしくお願いいたします。
      `,
      // 必要に応じてPDF添付を追加してください
      // attachments: [
      //   {
      //     filename: `invoice_${invoice.invoiceNumber}.pdf`,
      //     content: pdfBuffer
      //   }
      // ],
    });

    console.log(`請求書ID ${invoice.id} のリマインダーメールを送信しました。`);

    return NextResponse.json(
      { message: 'リマインダーメールが送信されました。' },
      { status: 200 }
    );
  } catch (error) {
    console.error('リマインダー送信中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}