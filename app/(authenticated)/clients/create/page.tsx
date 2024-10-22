// app/clients/create/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientForm from '@/app/(authenticated)/components/ClientForm';
import axios from '@/lib/api';
import { Category, Tag } from '@prisma/client';
import { CustomFormData } from '@/types/form';

const CreateClientPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/tags'),
        ]);
        setCategories(categoriesResponse.data);
        setTags(tagsResponse.data);
      } catch (err) {
        setError('データの取得に失敗しました。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (formData: CustomFormData) => {
    try {
      console.log('送信するデータ:', formData); // デバッグ用
      await axios.post('/api/clients', formData);
      router.push('/clients');
    } catch (err) {
      setError('クライアントの作成に失敗しました。');
      console.error(err);
    }
  };

  const handleClose = () => {
    router.push('/clients');
  };

  if (loading) {
    return <p>読み込み中...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">新しいクライアントの作成</h1>
      <ClientForm
        categories={categories}
        tags={tags}
        onSubmit={handleSubmit}
        client={null}
        onClose={handleClose}
      />
    </div>
  );
};

export default CreateClientPage;