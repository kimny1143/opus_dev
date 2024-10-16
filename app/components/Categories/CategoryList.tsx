'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent, Input } from '@ui/opus-components';
import { Button } from '@ui/Button';

interface Category {
  id: string;
  name: string;
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories/categories');
      setCategories(response.data);
    } catch (err) {
      setError('カテゴリの取得中にエラーが発生しました。');
      console.error(err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newCategoryName.trim()) {
      setError('カテゴリ名を入力してください。');
      return;
    }

    try {
      const response = await axios.post('/categories/categories', { name: newCategoryName });
      setCategories([...categories, response.data]);
      setNewCategoryName('');
    } catch (err) {
      setError('カテゴリの追加中にエラーが発生しました。');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await axios.delete(`/categories?id=${id}`);
      setCategories(categories.filter(category => category.id !== id));
    } catch (err) {
      setError('カテゴリの削除中にエラーが発生しました。');
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>カテゴリ一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddCategory} className="mb-4">
          <div className="flex">
            <Input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="新しいカテゴリ名"
              className="mr-2"
            />
            <Button type="submit">追加</Button>
          </div>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span>{category.name}</span>
              <Button variant="destructive" onClick={() => handleDeleteCategory(category.id)}>削除</Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default CategoryList;
