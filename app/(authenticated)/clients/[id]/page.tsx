'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { Client, ClientPageProps } from '@/lib/types';

const ClientPage: React.FC<ClientPageProps> = ({ params }) => {
  const { id } = params;
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`/api/clients/${id}`);
        setClient(response.data);
      } catch (err: any) {
        console.error('取引先の取得に失敗しました。', err.response?.data || err.message);
        setError(err.response?.data?.error || '取引先の取得に失敗しました。');
      }
    };

    fetchClient();
  }, [id]);

  if (!id) {
    return <p>無効なクライアントIDです。</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!client) {
    return <p>読み込み中...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">取引先詳細</h1>
      <div className="mb-4">
      <p><strong>会社名/屋号:</strong> {client.companyName}</p>
        <p><strong>所在地:</strong> {client.address}</p>
        <p><strong>担当者名:</strong> {client.contactName}</p>
        <p><strong>メールアドレス:</strong> {client.contactEmail}</p>
        <p><strong>電話番号:</strong> {client.contactPhone}</p>
        <p><strong>登録番号:</strong> {client.registrationNumber}</p>
        <p><strong>カテゴリー:</strong> {client.category?.name || '未設定'}</p>
        <p><strong>タグ:</strong> {client.tags?.map((t) => t.tag.name).join(', ') || '未設定'}</p>
        <p><strong>作成日:</strong> {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '未設定'}</p>
        <p><strong>更新日:</strong> {client.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : '未設定'}</p>
      </div>
      <div className="flex space-x-4">
        <Link href={`/clients/${id}/edit`}>
          <Button className="bg-blue-500 text-white">編集</Button>
        </Link>
      </div>
    </div>
  );
};

export default ClientPage;