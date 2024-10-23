'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/lib/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Client, Order, Invoice,InvoiceItem } from '@/lib/types';

const InvoiceDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id ? Number(params.id) : null;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (invoiceId !== null) {
      const fetchInvoice = async () => {
        try {
          const response = await axios.get(`/api/invoices/${invoiceId}`);
          setInvoice(response.data);
        } catch (err: any) {
          console.error('請求書取得エラー:', err);
          setError(err.response?.data?.error || '請求書の取得に失敗しました。');
        } finally {
          setLoading(false);
        }
      };

      fetchInvoice();
    }
  }, [invoiceId]);

  const handleExportPDF = () => {
    if (!invoice) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('請求書', 14, 22);

    doc.setFontSize(12);
    doc.text(`請求書番号: ${invoice.invoiceNumber}`, 14, 30);
    doc.text(`発行日: ${invoice.issueDate}`, 14, 36);
    doc.text(`支払期日: ${invoice.dueDate}`, 14, 42);
    doc.text(`ステータス: ${invoice.status}`, 14, 48);

    doc.text(`クライアント名: ${invoice.order.client.companyName}`, 14, 54);
    doc.text(`登録番号: ${invoice.order.client.registrationNumber}`, 14, 60);

    const tableColumn = ["説明", "数量", "単価", "合計"];
    const tableRows: Array<Array<string | number>> = [];

    invoice.items.forEach(item => {
      const itemData = [
        item.description,
        item.quantity,
        item.unitPrice,
        item.totalPrice || item.quantity * item.unitPrice,
      ];
      tableRows.push(itemData);
    });

    (doc as any).autoTable({
      startY: 70,
      head: [tableColumn],
      body: tableRows,
    });

    doc.text(`総額: ${invoice.totalAmount} 円`, 14, (doc as any).lastAutoTable.finalY + 10);

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  const handleSendEmail = async () => {
    if (!invoice) return;

    try {
      await axios.post(`/api/invoices/${invoice.id}/send-email`);
      alert('請求書がメールで送信されました！');
    } catch (err: any) {
      console.error('メール送信エラー:', err);
      alert(err.response?.data?.error || '請求書のメール送信に失敗しました。');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!invoice) {
    return <div className="container mx-auto p-4">請求書が見つかりません。</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">請求書詳細</h1>
      <div className="mb-4">
        <p><strong>請求書番号:</strong> {invoice.invoiceNumber}</p>
        <p><strong>発行日:</strong> {invoice.issueDate}</p>
        <p><strong>支払期日:</strong> {invoice.dueDate}</p>
        <p><strong>ステータス:</strong> {invoice.status}</p>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">クライアント情報</h2>
        <p><strong>会社名:</strong> {invoice.order.client.companyName}</p>
        <p><strong>登録番号:</strong> {invoice.order.client.registrationNumber}</p>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">請求書アイテム</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">説明</th>
              <th className="py-2">数量</th>
              <th className="py-2">単価</th>
              <th className="py-2">合計</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="text-center">
                <td className="py-2 border">{item.description}</td>
                <td className="py-2 border">{item.quantity}</td>
                <td className="py-2 border">{item.unitPrice}</td>
                <td className="py-2 border">{item.totalPrice || item.quantity * item.unitPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-right">
          <p><strong>総額:</strong> {invoice.totalAmount} 円</p>
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={handleExportPDF}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          PDFに出力
        </button>
        <button
          onClick={handleSendEmail}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          メール送信
        </button>
        <button
          onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          編集
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;