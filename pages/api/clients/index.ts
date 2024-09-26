import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const clients = await prisma.client.findMany();
      res.status(200).json(clients);
    } catch (error) {
      console.error('取引先取得エラー:', error);
      res.status(500).json({ error: '取引先の取得に失敗しました。' });
    }
  } else if (req.method === 'POST') {
    const { companyName, address, contactName, contactEmail, contactPhone, registrationNumber } = req.body;

    if (!companyName || !address || !contactName || !contactEmail || !contactPhone || !registrationNumber) {
      return res.status(400).json({ error: '必要な情報が不足しています。' });
    }

    try {
      const newClient = await prisma.client.create({
        data: {
          companyName,
          address,
          contactName,
          contactEmail,
          contactPhone,
          registrationNumber,
        },
      });
      res.status(201).json(newClient);
    } catch (error) {
      console.error('取引先作成エラー:', error);
      res.status(500).json({ error: '取引先の作成に失敗しました。' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}