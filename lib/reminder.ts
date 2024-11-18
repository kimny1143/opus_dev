import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const TAX_RATE = 0.1; // 10% 消費税

const sendReminderEmails = async () => {
  try {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    // 支払期限が近い（3日以内）または過ぎた請求書を取得
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

    for (const invoice of invoices) {
      if (!invoice.recipientClient || !invoice.recipientClient.contactEmail) {
        console.error(`請求書ID ${invoice.id} のクライアント情報が不足しています。`);
        continue;
      }

      const clientEmail = invoice.recipientClient.contactEmail;

      // リマインダーメールの送信
      await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: clientEmail,
        subject: `リマインダー: 請求書 ${invoice.invoiceNumber} の支払い期限が近づいています`,
        text: `拝啓

請求書番号 ${invoice.invoiceNumber} の支払期限が ${invoice.dueDate.toLocaleDateString('ja-JP')} に迫っています。お支払いのほどよろしくお願いいたします。

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
    }
  } catch (error) {
    console.error('リマインダー機能の実行中にエラーが発生しました:', error);
  }
};

// 毎日午前9時にリマインダーを実行
cron.schedule('0 9 * * *', () => {
  console.log('リマインダージョブを開始します...');
  sendReminderEmails();
});