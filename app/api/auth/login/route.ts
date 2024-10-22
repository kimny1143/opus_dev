import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'ユーザーが存在しません。' }, { status: 401 });
  }

  const passwordMatch = await compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json({ error: 'パスワードが正しくありません。' }, { status: 401 });
  }
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  const userData = { id: user.id, name: user.name, email: user.email };
  
  const response = NextResponse.json({ message: 'ログイン成功', user: userData });
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1時間
    path: '/',
    sameSite: 'lax',
  });

  return response;
}