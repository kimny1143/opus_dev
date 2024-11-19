import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { generateTokens, setTokens } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { name, email, password, companyName, address, phone, registrationNumber } = await req.json();

  // 必須フィールドの検証
  if (!name || !email || !password || !companyName || !address || !phone || !registrationNumber) {
    return NextResponse.json({ 
      error: '必須フィールドが不足しています。',
      requiredFields: ['name', 'email', 'password', 'companyName', 'address', 'phone', 'registrationNumber']
    }, { status: 400 });
  }

  // メールアドレスの形式を検証
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: '有効なメールアドレスを入力してください。' }, { status: 400 });
  }

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
        companyName,
        address,
        phone,
        registrationNumber
      },
    });

    // アクセストークンとリフレッシュトークンを生成
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email
    });

    const userData = { 
      id: user.id, 
      name: user.name, 
      email: user.email,
      companyName: user.companyName,
      address: user.address,
      phone: user.phone,
      registrationNumber: user.registrationNumber
    };
    
    const response = NextResponse.json({ message: '登録成功', user: userData });
    
    // トークンをクッキーに設定
    setTokens(response, accessToken, refreshToken);

    return response;
  } catch (error: any) {
    console.error('ユーザー登録エラー:', error.message);
    console.error('エラーのスタックトレース:', error.stack);
    console.error('エラーの詳細:', {
      name: error.name,
      code: error.code,
      cause: error.cause
    });
    return NextResponse.json({ error: 'ユーザー登録に失敗しました。' }, { status: 500 });
  }
}