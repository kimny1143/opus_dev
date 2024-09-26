'use client';

import React, { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { Card, Button, Input } from '@/components/ui/opus-components';

interface Client {
  id: number;
  companyName: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  registrationNumber: string;
  createdAt: string;
  updatedAt: string;
}

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    companyName: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    registrationNumber: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('取引先の取得に失敗しました。', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/clients', form);
      setForm({
        companyName: '',
        address: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        registrationNumber: '',
      });
      fetchClients();
      setError(null);
    } catch (err) {
      console.error('取引先の登録に失敗しました。', err);
      setError('取引先の登録に失敗しました。');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">取引先管理</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>新規取引先登録</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <Input
              type="text"
              name="companyName"
              placeholder="会社名"
              value={form.companyName}
              onChange={handleChange}
              required
              className="mb-4"
            />
            <Input
              type="text"
              name="address"
              placeholder="所在地"
              value={form.address}
              onChange={handleChange}
              required
              className="mb-4"
            />
            <Input
              type="text"
              name="contactName"
              placeholder="担当者名"
              value={form.contactName}
              onChange={handleChange}
              required
              className="mb-4"
            />
            <Input
              type="email"
              name="contactEmail"
              placeholder="担当者メールアドレス"
              value={form.contactEmail}
              onChange={handleChange}
              required
              className="mb-4"
            />
            <Input
              type="text"
              name="contactPhone"
              placeholder="担当者電話番号"
              value={form.contactPhone}
              onChange={handleChange}
              required
              className="mb-4"
            />
            <Input
              type="text"
              name="registrationNumber"
              placeholder="登録番号"
              value={form.registrationNumber}
              onChange={handleChange}
              required
              className="mb-4"
            />
            <Button type="submit">登録</Button>
          </CardContent>
        </Card>
      </form>

      <div>
        <h2 className="text-2xl font-semibold mb-4">取引先一覧</h2>
        {clients.map(client => (
          <Card key={client.id} className="mb-4">
            <CardHeader>
              <CardTitle>{client.companyName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>所在地: {client.address}</p>
              <p>担当者: {client.contactName}</p>
              <p>メール: {client.contactEmail}</p>
              <p>電話番号: {client.contactPhone}</p>
              <p>登録番号: {client.registrationNumber}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientsPage;