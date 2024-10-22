'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientForm from '@/app/(authenticated)/components/ClientForm';
import axios from '@/lib/api';
import { Category, Tag } from '@prisma/client';
import { CustomFormData } from '@/types/form';

type Client = CustomFormData & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

const EditClientPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientResponse, categoriesResponse, tagsResponse] = await Promise.all([
          axios.get(`/api/clients/${params.id}`),
          axios.get('/api/categories'),
          axios.get('/api/tags'),
        ]);
        const clientData = clientResponse.data;
        setClient({
          ...clientData,
          tagIds: clientData.tags.map((tag: { id: number }) => tag.id)
        });
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
  }, [params.id]);

  const handleSubmit = async (formData: CustomFormData) => {
    try {
      await axios.put(`/api/clients/${params.id}`, formData);
      router.push('/clients');
    } catch (err) {
      setError('クライアントの更新に失敗しました。');
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
      <h1 className="text-2xl mb-4">取引先の編集</h1>
      {client && (
        <ClientForm
          categories={categories}
          tags={tags}
          onSubmit={handleSubmit}
          client={client}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default EditClientPage;