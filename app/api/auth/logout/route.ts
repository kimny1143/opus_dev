// app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: 'ログアウト成功' }, { status: 200 });
    // auth_tokenクッキーをクリア
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      expires: new Date(0), // クッキーを期限切れに設定
    });
    return response;
  } catch (error) {
    console.error('ログアウトエラー:', error);
    return NextResponse.json({ error: 'ログアウトに失敗しました。' }, { status: 500 });
  }
}