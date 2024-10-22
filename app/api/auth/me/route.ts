    import { NextRequest, NextResponse } from 'next/server';
    import prisma from '@/lib/prisma';
    import jwt from 'jsonwebtoken';
    
    export async function GET(req: NextRequest) {
      const token = req.cookies.get('auth_token')?.value;
      if (!token) {
        return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
      }
    
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const userId = parseInt(decoded.userId, 10);
        if (isNaN(userId)) {
          return NextResponse.json({ error: '無効なユーザーIDです。' }, { status: 400 });
        }
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true },
        });
    
        if (!user) {
          return NextResponse.json({ error: 'ユーザーが見つかりません。' }, { status: 404 });
        }
    
        console.log('認証されたユーザー:', user);
        return NextResponse.json({ user }, { status: 200 });
      } catch (error) {
        console.error('認証エラー:', error);
        return NextResponse.json({ error: '無効な認証トークンです。' }, { status: 401 });
      }
    }
