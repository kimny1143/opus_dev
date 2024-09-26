import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
// ここにメール送信サービスのインポートを追加
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'メールアドレスが必要です。' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'ユーザーが存在しません。' });
      }

      // トークンの生成
      const token = crypto.randomBytes(32).toString('hex');
      const resetToken = {
        token,
        userId: user.id,
        expires: new Date(Date.now() + 3600000), // 1時間有効
      };

      // トークンを保存するモデルが必要（Prismaスキーマに追加すること）
      await prisma.resetToken.create({
        data: resetToken,
      });

      // メール送信設定（適宜設定を変更してください）
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const resetUrl = `http://localhost:3000/auth/reset-password/${token}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'パスワードリセット',
        html: `<p>パスワードをリセットするには、以下のリンクをクリックしてください：</p>
               <a href="${resetUrl}">${resetUrl}</a>`,
      });

      res.status(200).json({ message: 'パスワードリセットメールを送信しました。' });
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      res.status(500).json({ message: 'サーバーエラー' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}