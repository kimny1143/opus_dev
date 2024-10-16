// app/api/auth/password-reset/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'メールアドレスが必要です。' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'ユーザーが存在しません。' }, { status: 404 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    const resetToken = {
      token,
      userId: user.id,
      createdAt: new Date(),
      expires: new Date(Date.now() + 3600000), // 1時間後に期限切れ
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

    return NextResponse.json({ message: 'パスワードリセットメールを送信しました。' }, { status: 200 });
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 });
  }
}