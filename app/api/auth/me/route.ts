    import { NextRequest, NextResponse } from 'next/server';
    import { verifyToken } from '@/lib/auth';
    import prisma from '@/lib/prisma';
    
    export async function GET(req: NextRequest) {
      const token = req.cookies.get('auth_token')?.value;
    
      if (!token) {
        return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
      }
    
      try {
        const decoded = await verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, name: true, email: true },
        });
        if (!user) {
          return NextResponse.json({ error: 'ユーザーが存在しません。' }, { status: 404 });
        }
        return NextResponse.json({ user });
      } catch (error) {
        return NextResponse.json({ error: '無効なトークンです。' }, { status: 401 });
      }
    }
