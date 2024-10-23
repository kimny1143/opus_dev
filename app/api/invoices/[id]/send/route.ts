
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { Readable } from 'stream';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
    // 請求書データの取得
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
            items: true
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: '請求書が見つかりません。' }, { status: 404 });
    }

    if (!invoice.order) {
      return NextResponse.json({ error: '請求書に関連する注文が見つかりません。' }, { status: 400 });
    }

    // クライアントのメールアドレスを取得
    const clientEmail = invoice.order.client.contactEmail;
    if (!clientEmail) {
      return NextResponse.json({ error: 'クライアントのメールアドレスが設定されていません。' }, { status: 400 });
    }

    // PDFドキュメントの作成
    const doc = new PDFDocument({ margin: 50 });

    // PDFをバッファに保存するためのストリーム
    const buffers: Uint8Array[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // PDFコンテンツの作成
    doc.fontSize(20).text('請求書', { align: 'center' });

    doc.moveDown();
    doc.fontSize(12).text(`請求書番号: ${invoice.invoiceNumber}`);
    doc.text(`発行日: ${new Date(invoice.issueDate).toLocaleDateString()}`);
    doc.text(`支払期日: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.text(`ステータス: ${invoice.status === 'unpaid' ? '未払い' : invoice.status === 'paid' ? '支払い済み' : '延滞'}`);

    doc.moveDown();
    doc.fontSize(14).text('クライアント情報', { underline: true });
    doc.fontSize(12).text(`会社名: ${invoice.order.client.companyName}`);
    doc.text(`登録番号: ${invoice.order.client.registrationNumber}`);

    doc.moveDown();
    doc.fontSize(14).text('請求書アイテム', { underline: true });

    // テーブルヘッダー
    doc.fontSize(12);
    doc.text('説明', 50, doc.y, { continued: true });
    doc.text('数量', 250, doc.y, { continued: true });
    doc.text('単価', 350, doc.y, { continued: true });
    doc.text('合計', 450, doc.y);
    doc.moveDown();

    // テーブル内容
    invoice.items.forEach((item) => {
      doc.text(item.description, 50, doc.y, { continued: true });
      doc.text(item.quantity.toString(), 250, doc.y, { continued: true });
      doc.text(`¥${item.unitPrice.toLocaleString()}`, 350, doc.y, { continued: true });
      const totalPrice = item.quantity * item.unitPrice;
      doc.text(`¥${totalPrice.toLocaleString()}`, 450, doc.y);
    });

    doc.moveDown();
    doc.fontSize(12).text(`総額: ¥${invoice.totalAmount.toLocaleString()}`, { align: 'right' });

    // ドキュメントの終了
    doc.end();

    // バッファを結合
    const pdfBuffer = Buffer.concat(buffers);

    // Nodemailer トランスポーターの設定
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // 例: 'smtp.gmail.com'
      port: Number(process.env.EMAIL_PORT), // 例: 587
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // メールアカウント
        pass: process.env.EMAIL_PASS, // メールパスワード
      },
    });

    // メールオプションの設定
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`, // 送信者情報
      to: clientEmail, // 受信者
      subject: `請求書 ${invoice.invoiceNumber} の送信`,
      text: `拝啓、\n\n請求書 ${invoice.invoiceNumber} を添付しておりますので、ご確認ください。\n\nよろしくお願いいたします。\n`,
      attachments: [
        {
          filename: `invoice_${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // メールの送信
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: '請求書がメールで送信されました。' }, { status: 200 });
  } catch (error) {
    console.error('メール送信エラー:', error);
    return NextResponse.json({ error: '請求書のメール送信に失敗しました。' }, { status: 500 });
  }
}