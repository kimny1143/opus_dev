
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken, verifyToken } from '@/lib/auth';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

// 税率の定義
const TAX_RATE = 0.10; // 10%

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
  }

  try {
    await verifyToken(token);
    const { id } = params;
    const invoiceId = Number(id);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: '有効な請求書IDを提供してください。' }, { status: 400 });
    }

    // 請求書データの取得
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        issuerUser: {
          select: {
            name: true,
            email: true,
            companyName: true,
            registrationNumber: true,
            address: true,
            phone: true
          }
        },
        issuerClient: {
          select: {
            companyName: true,
            registrationNumber: true,
            address: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true
          }
        },
        recipientUser: {
          select: {
            name: true,
            email: true,
            companyName: true,
            registrationNumber: true,
            address: true,
            phone: true
          }
        },
        recipientClient: {
          select: {
            companyName: true,
            registrationNumber: true,
            address: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true
          }
        },
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

    // PDFドキュメントの作成
    const doc = new PDFDocument({ margin: 50 });

    // PDFをバッファに保存するためのストリーム
    const buffers: Uint8Array[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // ヘッダー部分
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
    } else if (invoice.issuerUser) {
      doc.text(`事業者名: ${invoice.issuerUser.companyName}`);
      doc.text(`適格請求書発行事業者登録番号: ${invoice.issuerUser.registrationNumber}`);
      doc.text(`本店所在地: ${invoice.issuerUser.address}`);
      doc.text(`担当者: ${invoice.issuerUser.name}`);
      doc.text(`電話番号: ${invoice.issuerUser.phone}`);
      doc.text(`メールアドレス: ${invoice.issuerUser.email}`);
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
    } else if (invoice.recipientUser) {
      doc.text(`会社名: ${invoice.recipientUser.companyName}`);
      doc.text(`住所: ${invoice.recipientUser.address}`);
      doc.text(`担当者: ${invoice.recipientUser.name}`);
      doc.text(`電話番号: ${invoice.recipientUser.phone}`);
      doc.text(`メールアドレス: ${invoice.recipientUser.email}`);
    }

    // 取引内容
    doc.moveDown();
    doc.fontSize(14).text('取引内容明細', { underline: true });

    // テーブルヘッダー
    doc.fontSize(12);
    doc.text('品目', 50, doc.y, { continued: true });
    doc.text('数量', 200, doc.y, { continued: true });
    doc.text('単価', 280, doc.y, { continued: true });
    doc.text('税率', 360, doc.y, { continued: true });
    doc.text('消費税額', 420, doc.y, { continued: true });
    doc.text('小計', 480, doc.y);
    doc.moveDown();

    // 明細行の表示と計算
    let subtotal = 0;
    let totalTax = 0;

    invoice.items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemTax = itemSubtotal * TAX_RATE;
      subtotal += itemSubtotal;
      totalTax += itemTax;

      doc.text(item.description, 50, doc.y, { continued: true });
      doc.text(item.quantity.toString(), 200, doc.y, { continued: true });
      doc.text(`¥${item.unitPrice.toLocaleString()}`, 280, doc.y, { continued: true });
      doc.text('10%', 360, doc.y, { continued: true });
      doc.text(`¥${itemTax.toLocaleString()}`, 420, doc.y, { continued: true });
      doc.text(`¥${itemSubtotal.toLocaleString()}`, 480, doc.y);
    });

    // 合計金額
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`税抜金額: ¥${subtotal.toLocaleString()}`, { align: 'right' });
    doc.text(`消費税額（10%）: ¥${totalTax.toLocaleString()}`, { align: 'right' });
    doc.text(`税込合計金額: ¥${(subtotal + totalTax).toLocaleString()}`, { align: 'right' });

    // 備考
    doc.moveDown();
    doc.fontSize(10);
    doc.text('※この請求書は電子帳簿保存法に基づき電子的に保存されます。', { align: 'left' });
    doc.text('※本請求書は適格請求書等保存方式に対応した請求書です。', { align: 'left' });

    // ドキュメントの終了
    doc.end();

    // バッファを結合
    const pdfBuffer = Buffer.concat(buffers);

    // レスポンスとしてPDFを返す
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`,
      },
    });
  } catch (error) {
    console.error('PDF生成エラー:', error);
    return NextResponse.json({ error: '請求書のPDF生成に失敗しました。' }, { status: 500 });
  }
}