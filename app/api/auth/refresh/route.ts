import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens, getRefreshToken, setTokens } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // リフレッシュトークンをクッキーから取得
    const refreshToken = getRefreshToken(req);

    if (!refreshToken) {
      return NextResponse.json({ error: 'リフレッシュトークンが必要です。' }, { status: 400 });
    }

    // リフレッシュトークンを検証
    const payload = await verifyRefreshToken(refreshToken);

    // 新しいトークンを生成
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: payload.userId,
      email: payload.email
    });
    
    // レスポンスを作成
    const response = NextResponse.json({ success: true });

    // 新しいトークンをクッキーにセット
    setTokens(response, accessToken, newRefreshToken);
    
    return response;

  } catch (error) {
    console.error('リフレッシュトークンの検証中にエラーが発生しました:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}