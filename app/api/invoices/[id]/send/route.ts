
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// 税率の定義
const TAX_RATE = 0.10; // 10%

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

    // 基本情報
    doc.fontSize(12);
    doc.text(`請求書番号: ${invoice.invoiceNumber}`);
    doc.text(`取引年月日: ${new Date(invoice.issueDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}`);
    doc.text(`支払期限: ${new Date(invoice.dueDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}`);
    doc.text(`取引区分: 課税取引`);

    // 発行者情報
    doc.moveDown();
    doc.fontSize(14).text('発行者情報', { underline: true });
    doc.fontSize(12);
    if (invoice.issuerClient) {
      doc.text(`事業者名: ${invoice.issuerClient.companyName}`);
      doc.text(`適格請求書発行事業者登録番号: ${invoice.issuerClient.registrationNumber}`);
      doc.text(`本店所在地: ${invoice.issuerClient.address}`);
      doc.text(`担当者: ${invoice.issuerClient.contactName}`);
      doc.text(`電話番号: ${invoice.issuerClient.contactPhone}`);
      doc.text(`メールアドレス: ${invoice.issuerClient.contactEmail}`);
    }

    // 受領者情報
    doc.moveDown();
    doc.fontSize(14).text('受領者情報', { underline: true });
    doc.fontSize(12);
    if (invoice.recipientClient) {
      doc.text(`会社名: ${invoice.recipientClient.companyName}`);
      doc.text(`登録番号: ${invoice.recipientClient.registrationNumber}`);
      doc.text(`住所: ${invoice.recipientClient.address}`);
      doc.text(`担当者: ${invoice.recipientClient.contactName}`);
      doc.text(`電話番号: ${invoice.recipientClient.contactPhone}`);
      doc.text(`メールアドレス: ${invoice.recipientClient.contactEmail}`);
    }

    // 取引内容明細
    doc.moveDown();
    doc.fontSize(14).text('取引内容明細', { underline: true });

    // テーブルヘッダー
    doc.fontSize(12);
    doc.text('品名・サービス', 50, doc.y, { continued: true });
    doc.text('数量', 250, doc.y, { continued: true });
    doc.text('単価', 350, doc.y, { continued: true });
    doc.text('金額', 450, doc.y);
    doc.moveDown();

    // テーブル内容
    let subtotal = 0;
    invoice.items.forEach((item) => {
      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;
      doc.text(item.description, 50, doc.y, { continued: true });
      doc.text(item.quantity.toString(), 250, doc.y, { continued: true });
      doc.text(`¥${item.unitPrice.toLocaleString()}`, 350, doc.y, { continued: true });
      doc.text(`¥${totalPrice.toLocaleString()}`, 450, doc.y);
    });

    // 合計金額情報
    doc.moveDown();
    const taxAmount = subtotal * TAX_RATE;
    const totalAmount = subtotal + taxAmount;

    doc.fontSize(12).text(`小計: ¥${subtotal.toLocaleString()}`, { align: 'right' });
    doc.text(`消費税（${TAX_RATE * 100}%）: ¥${taxAmount.toLocaleString()}`, { align: 'right' });
    doc.text(`合計金額（税込）: ¥${totalAmount.toLocaleString()}`, { align: 'right' });

    // 支払い条件
    doc.moveDown();
    doc.fontSize(12).text('支払い条件', { underline: true });
    doc.text('お支払いは請求書に記載された期日までにお願いいたします。');

    // ドキュメントの終了
    doc.end();

    // Resendの設定
    const resend = new Resend(process.env.RESEND_API_KEY);

    // メールの送信
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: [clientEmail],
      subject: `請求書 ${invoice.invoiceNumber} の送信`,
      text: `拝啓\n\n請求書 ${invoice.invoiceNumber} を添付いたしましたので、ご確認ください。\n\nよろしくお願いいたします。\n`,
      attachments: [
        {
          filename: `invoice_${invoice.invoiceNumber}.pdf`,
          content: Buffer.concat(buffers)
        }
      ]
    });

    return NextResponse.json({ message: '請求書がメールで送信されました。' }, { status: 200 });
  } catch (error) {
    console.error('メール送信エラー:', error);
    return NextResponse.json({ error: '請求書のメール送信に失敗しました。' }, { status: 500 });
  }
}