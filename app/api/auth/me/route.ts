    import { NextRequest, NextResponse } from 'next/server';
    import { verifyToken, verifyRefreshToken, generateTokens, setTokens, getToken, getRefreshToken } from '@/lib/auth';
    import prisma from '@/lib/prisma';
    
    export async function GET(req: NextRequest) {
      const token = getToken(req);
      const refreshToken = getRefreshToken(req);
    
      if (!token && !refreshToken) {
        return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 401 });
      }
    
      try {
        let decoded: { userId: number; email: string } | undefined;
        let response;
    
        try {
          // まずアクセストークンを検証
          if (token) {
            decoded = await verifyToken(token);
          }
        } catch (error) {
          // アクセストークンが無効な場合、リフレッシュトークンを使用
          if (refreshToken) {
            try {
              decoded = await verifyRefreshToken(refreshToken);
              
              // 新しいトークンを生成
              const tokens = generateTokens({
                userId: decoded.userId,
                email: decoded.email
              });
    
              response = NextResponse.json({ user: null });
              setTokens(response, tokens.accessToken, tokens.refreshToken);
            } catch (refreshError) {
              return NextResponse.json({ error: 'セッションの有効期限が切れました。再度ログインしてください。' }, { status: 401 });
            }
          } else {
            return NextResponse.json({ error: '無効なトークンです。' }, { status: 401 });
          }
        }

        if (!decoded) {
          return NextResponse.json({ error: '認証情報が見つかりません。' }, { status: 401 });
        }
    
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, name: true, email: true },
        });
    
        if (!user) {
          return NextResponse.json({ error: 'ユーザーが存在しません。' }, { status: 404 });
        }
    
        // レスポンスがまだ作成されていない場合（トークンの更新がない場合）
        if (!response) {
          response = NextResponse.json({ user });
        } else {
          // トークンが更新された場合、ユーザー情報を設定
          response = NextResponse.json({ user });
        }
    
        return response;
      } catch (error) {
        return NextResponse.json({ error: '認証に失敗しました。' }, { status: 401 });
      }
    }
