
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken, verifyToken } from '@/lib/auth';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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

    // PDFコンテンツの作成
    doc.fontSize(20).text('請求書', { align: 'center' });

    doc.moveDown();
    doc.fontSize(12).text(`請求書番号: ${invoice.invoiceNumber}`);
    doc.text(`発行日: ${new Date(invoice.issueDate).toLocaleDateString()}`);
    doc.text(`支払期日: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.text(`ステータス: ${invoice.status === 'unpaid' ? '未払い' : invoice.status === 'paid' ? '支払い済み' : '延滞'}`);

    // 発行者情報の表示
    doc.moveDown();
    doc.fontSize(14).text('発行者情報', { underline: true });
    if (invoice.issuerClient) {
      doc.fontSize(12).text(`会社名: ${invoice.issuerClient.companyName}`);
      doc.text(`登録番号: ${invoice.issuerClient.registrationNumber}`);
    } else if (invoice.issuerUser) {
      doc.fontSize(12).text(`名前: ${invoice.issuerUser.name}`);
      doc.text(`メール: ${invoice.issuerUser.email}`);
    }

    // 受領者情報の表示
    doc.moveDown();
    doc.fontSize(14).text('受領者情報', { underline: true });
    if (invoice.recipientClient) {
      doc.fontSize(12).text(`会社名: ${invoice.recipientClient.companyName}`);
      doc.text(`登録番号: ${invoice.recipientClient.registrationNumber}`);
    } else if (invoice.recipientUser) {
      doc.fontSize(12).text(`名前: ${invoice.recipientUser.name}`);
      doc.text(`メール: ${invoice.recipientUser.email}`);
    }

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