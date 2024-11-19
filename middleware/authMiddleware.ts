import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    console.log('認証トークンがありません。');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await verifyToken(token);
    console.log('認証トークンが有効です。');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('認証エラー:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/clients/:path*', '/invoices/:path*'],
};
