import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { generateTokens, setTokens } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'このメールアドレスは既に登録されています。' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // アクセストークンとリフレッシュトークンを生成
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email
    });

    const userData = { id: user.id, name: user.name, email: user.email };
    
    const response = NextResponse.json({ message: '登録成功', user: userData });
    
    // トークンをクッキーに設定
    setTokens(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json({ error: 'ユーザー登録に失敗しました。' }, { status: 500 });
  }
}