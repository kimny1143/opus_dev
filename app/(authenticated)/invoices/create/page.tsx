'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/opus-components';
import { Input } from '@/app/components/ui/opus-components';
import { Button } from '@/app/components/ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Client {
  id: string;
  name: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

const CreateInvoicePage: React.FC = () => {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 0, unitPrice: 0 }]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/clients');
        setClients(response.data);
      } catch (error) {
        console.error('クライアントの取得に失敗しました:', error);
      }
    };

    fetchClients();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 0, unitPrice: 0 }]);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index][field] = value as never;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ここでバックエンドAPIを呼び出してインボイスを保存する処理を実装
    // 保存が成功したら、PDFを生成してダウンロード
    generatePDF();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const selectedClientName = clients.find(client => client.id === selectedClient)?.name || '';

    doc.setFontSize(20);
    doc.text('請求書', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`請求書番号: ${invoiceNumber}`, 20, 40);
    doc.text(`発行日: ${issueDate}`, 20, 50);
    doc.text(`支払期限: ${dueDate}`, 20, 60);

    doc.text(`請求先: ${selectedClientName}`, 20, 80);

    const tableData = items.map(item => [
      item.description,
      item.quantity.toString(),
      `¥${item.unitPrice.toLocaleString()}`,
      `¥${(item.quantity * item.unitPrice).toLocaleString()}`
    ]);

    (doc as any).autoTable({
      startY: 100,
      head: [['品目', '数量', '単価', '金額']],
      body: tableData,
    });

    const total = calculateTotal();
    const tax = total * 0.1; // 10%の消費税
    const grandTotal = total + tax;

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.text(`小計: ¥${total.toLocaleString()}`, 150, finalY + 20);
    doc.text(`消費税 (10%): ¥${tax.toLocaleString()}`, 150, finalY + 30);
    doc.text(`合計: ¥${grandTotal.toLocaleString()}`, 150, finalY + 40);

    doc.save('invoice.pdf');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>新規請求書作成</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={selectedClient} onValueChange={(value: string) => setSelectedClient(value)}>
            <SelectTrigger>
              <SelectValue placeholder="取引先を選択" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="請求書番号"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
          />

          <Input
            type="date"
            placeholder="発行日"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />

          <Input
            type="date"
            placeholder="支払期限"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          {items.map((item, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                type="text"
                placeholder="品目"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                required
              />
              <Input
                type="number"
                placeholder="数量"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                required
              />
              <Input
                type="number"
                placeholder="単価"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(index, 'unitPrice', parseInt(e.target.value))}
                required
              />
            </div>
          ))}

          <Button type="button" onClick={handleAddItem}>項目を追加</Button>

          <div>
            <p>合計: ¥{calculateTotal().toLocaleString()}</p>
          </div>

          <Button type="submit">請求書を作成</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateInvoicePage;
