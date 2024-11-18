import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { generateTokens, setTokens } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'ユーザーが存在しません。' }, { status: 401 });
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'パスワードが正しくありません。' }, { status: 401 });
    }

    // アクセストークンとリフレッシュトークンを生成
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email
    });

    const userData = { id: user.id, name: user.name, email: user.email };
    
    const response = NextResponse.json({ 
      message: 'ログイン成功', 
      user: userData,
      accessToken 
    });
    
    // トークンをクッキーに設定
    setTokens(response, accessToken, refreshToken);

    return response;

  } catch (error) {
    console.error('ログイン中にエラーが発生しました:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}