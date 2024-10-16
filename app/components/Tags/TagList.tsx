'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Input, Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/opus-components';
import { Button } from '@/app/components/ui/Button';

interface Tag {
  id: string;
  name: string;
}

const TagList: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('/tags');
      setTags(response.data);
    } catch (err) {
      setError('タグの取得中にエラーが発生しました。');
      console.error(err);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const response = await axios.post('/tags', { name: newTagName });
      setTags([...tags, response.data]);
      setNewTagName('');
    } catch (err) {
      setError('タグの追加中にエラーが発生しました。');
      console.error(err);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await axios.delete(`/tags?id=${id}`);
      setTags(tags.filter(tag => tag.id !== id));
    } catch (err) {
      setError('タグの削除中にエラーが発生しました。');
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>タグ一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTag} className="mb-4">
          <div className="flex">
            <Input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="新しいタグ名"
              className="mr-2"
            />
            <Button type="submit">追加</Button>
          </div>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <ul className="space-y-2">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span>{tag.name}</span>
              <Button variant="destructive" onClick={() => handleDeleteTag(tag.id)}>削除</Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TagList;
