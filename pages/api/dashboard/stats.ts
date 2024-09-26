import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const totalClients = await prisma.client.count();
      const totalOrders = await prisma.order.count(); // 'order' モデルが必要
      const totalInvoices = await prisma.invoice.count(); // 'invoice' モデルが必要

      res.status(200).json({
        totalClients,
        totalOrders,
        totalInvoices,
      });
    } catch (error) {
      console.error('統計情報取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラー' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}