// app/api/auth/password-reset/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { generateTokens } from '@/lib/auth';

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

    // アクセストークンとリフレッシュトークンを生成
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email
    });

    const resetToken = {
      token: accessToken,
      userId: user.id,
      createdAt: new Date(),
      expires: new Date(Date.now() + 3600000), // アクセストークンの有効期限: 1時間
    };

    // トークンを保存
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

    const resetUrl = `http://localhost:3000/auth/reset-password/${accessToken}`;

    const response = NextResponse.json(
      { message: 'パスワードリセットメールを送信しました。' },
      { status: 200 }
    );

    // トークンをHTTPOnlyクッキーとして設定
    response.cookies.set('reset_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1時間
    });

    response.cookies.set('reset_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600 // 7日間
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'パスワードリセット',
      html: `<p>パスワードをリセットするには、以下のリンクをクリックしてください：</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>このリンクは1時間後に期限切れとなります。</p>`,
    });

    return response;
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 });
  }
}