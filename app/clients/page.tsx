'use client';

import React from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/opus-components';
import Modal from '@/app/components/ui/Modal';
import ClientForm from '@/app/components/ClientForm';
import { Category, Tag } from '@prisma/client';
import { CustomFormData } from '@/types/form';
import ErrorMessage from '@/app/components/ErrorMessage';
import { useAuth } from '@/app/providers/AuthProvider'; // AuthProviderのフックをインポート
import { useRouter } from 'next/navigation';

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
  category?: {
    id: number;
    name: string;
  };
  tags: {
    tag: {
      id: number;
      name: string;
    };
  }[];
}

const ClientsPage: React.FC = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = React.useState<Client[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [categoryNames, setCategoryNames] = React.useState<string[]>(['すべて']);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const { user } = useAuth(); // AuthProviderからユーザー情報を取得
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [clientsRes, categoriesRes, tagsRes] = await Promise.all([
        axios.get('/api/clients'), // '/api/' を追加
        axios.get('/api/categories'), // '/api/' を追加
        axios.get('/api/tags') // '/api/' を追加
      ]);

      const fetchedClients: Client[] = clientsRes.data;
      const fetchedCategories: Category[] = categoriesRes.data;
      const fetchedTags: Tag[] = tagsRes.data;

      setClients(fetchedClients);
      setFilteredClients(fetchedClients);
      setCategories(fetchedCategories);
      setTags(fetchedTags);

      const names = ['すべて', ...new Set(fetchedClients.map(client => client.category?.name).filter(Boolean))] as string[];
      setCategoryNames(names);
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
      setError('データの取得に失敗しました。再度お試しください。');
    }
  };

  React.useEffect(() => {
    if (!user) {
      router.push('/login'); // ユーザーが認証されていない場合、ログインページへリダイレクト
      return;
    }
    fetchData();
  }, [user, router]);

  React.useEffect(() => {
    const applyFilters = () => {
      const filtered = clients.filter(client =>
        (client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contactName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (categoryFilter === '' || categoryFilter === 'すべて' || client.category?.name === categoryFilter)
      );
      setFilteredClients(filtered);
    };

    applyFilters();
  }, [searchTerm, categoryFilter, clients]);

  const openModal = (client: Client | null = null) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedClient(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: CustomFormData) => {
    try {
      if (selectedClient) {
        await axios.put(`/api/clients/${selectedClient.id}`, data); // 修正
      } else {
        await axios.post('/api/clients', data); // 修正
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error('クライアントの作成・更新に失敗しました:', error);
      setError('クライアントの作成・更新に失敗しました。再度お試しください。');
    }
  };

  const headers = ['会社名', '担当者名', 'カテゴリ', 'タグ', '操作'];

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">取引先一覧</h1>
      <div className="flex items-center mb-4">
        <Input
          type="text"
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-4"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="max-w-xs mr-4"
        >
          {categoryNames.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <Button onClick={() => openModal()}>新規登録</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map(client => (
            <TableRow key={client.id}>
              <TableCell>{client.companyName}</TableCell>
              <TableCell>{client.contactName}</TableCell>
              <TableCell>{client.category?.name || 'なし'}</TableCell>
              <TableCell>{client.tags.map(toc => toc.tag.name).join(', ') || 'なし'}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => openModal(client)}>編集</Button>
                <Link href={`/clients/${client.id}`}>
                  <Button variant="outline" size="sm">詳細</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ClientForm
          client={selectedClient ? {
            ...selectedClient,
            categoryId: selectedClient.category?.id || null,
            tagIds: selectedClient.tags.map(toc => toc.tag.id)
          } : null}
          onSubmit={handleSubmit}
          onClose={closeModal}
          categories={categories}
          tags={tags}
        />
      </Modal>
    </div>
  );
};

export default ClientsPage;