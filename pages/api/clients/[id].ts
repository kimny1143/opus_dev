import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: '有効なIDを提供してください。' });
  }

  const clientId = Number(id);
  if (isNaN(clientId)) {
    return res.status(400).json({ error: '有効な数値IDを提供してください。' });
  }

  if (req.method === 'GET') {
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });
      if (client) {
        res.status(200).json(client);
      } else {
        res.status(404).json({ error: '取引先が見つかりません。' });
      }
    } catch (error) {
      console.error('取引先取得エラー:', error);
      res.status(500).json({ error: '取引先の取得に失敗しました。' });
    }
  } else if (req.method === 'PUT') {
    const { companyName, address, contactName, contactEmail, contactPhone, registrationNumber } = req.body;

    if (!companyName || !address || !contactName || !contactEmail || !contactPhone || !registrationNumber) {
      return res.status(400).json({ error: '必要な情報が不足しています。' });
    }

    try {
      const updatedClient = await prisma.client.update({
        where: { id: clientId },
        data: {
          companyName,
          address,
          contactName,
          contactEmail,
          contactPhone,
          registrationNumber,
        },
      });
      res.status(200).json(updatedClient);
    } catch (error) {
      console.error('取引先更新エラー:', error);
      res.status(500).json({ error: '取引先の更新に失敗しました。' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.client.delete({
        where: { id: clientId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('取引先削除エラー:', error);
      res.status(500).json({ error: '取引先の削除に失敗しました。' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}