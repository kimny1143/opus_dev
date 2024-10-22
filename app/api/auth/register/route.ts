import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    const userData = { id: user.id, name: user.name, email: user.email };
    
    const response = NextResponse.json({ message: '登録成功', user: userData });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1時間
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json({ error: 'ユーザー登録に失敗しました。' }, { status: 500 });
  }
}