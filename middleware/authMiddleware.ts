import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    console.log('認証トークンがありません');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    console.log('トークンが見つかりました:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log('デコードされたトークン:', decoded);
    return NextResponse.next();
  } catch (error) {
    console.error('認証エラー:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/clients/:path*', '/invoices/:path*'],
};
