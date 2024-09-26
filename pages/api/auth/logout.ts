import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // トークンの削除やセッションの終了処理をここに実装
    res.status(200).json({ message: 'ログアウトしました。' });
  } catch (error) {
    console.error('ログアウトエラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};