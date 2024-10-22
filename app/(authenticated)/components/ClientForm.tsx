'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/app/components/ui/Button';
import { Input, Card, CardHeader, CardContent } from '@/app/components/ui/opus-components';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { CustomFormData } from '@/types/form';
import { Category, Tag } from '@prisma/client';
import ErrorMessage from '@/app/components/ErrorMessage';
import TagChip from '@/app/components/Tags/TagChip';

interface ClientFormProps {
  client: CustomFormData | null;
  onSubmit: (data: CustomFormData) => Promise<void>;
  onClose: () => void;
  categories: Category[];
  tags: Tag[];
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit, onClose, categories, tags }) => {
  const { user } = useAuth();
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<CustomFormData>({
    defaultValues: client || {
      companyName: '',
      address: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      registrationNumber: '',
      categoryId: null,
      tagIds: [],
      status: 'active',
    },
  });
  const selectedCategoryId = watch('categoryId');
  const isPersonal = selectedCategoryId === 1;
  
  useEffect(() => {
    if (isPersonal) {
      setValue('companyName', 'none');
    } else if (watch('companyName') === 'none') {
      setValue('companyName', '');
    }
  }, [isPersonal, setValue, watch]);

  // companyName フィールドの render 関数
  const renderCompanyNameField = () => (
    <Controller
      name="companyName"
      control={control}
      rules={{ required: !isPersonal }}
      render={({ field }) => (
        <div>
          <Input
            {...field}
            type="text"
            placeholder="会社名"
            value={isPersonal ? 'none' : field.value?.toString() ?? ''}
            disabled={isPersonal}
          />
          {!isPersonal && <ErrorMessage message={errors.companyName?.message || ''} />}
        </div>
      )}
    />
  );
  
  const onSubmitForm = async (data: CustomFormData) => {
    if (!user) {
      console.error('ユーザーが認証されていません');
      return;
    }

    try {
      const formattedData = {
        ...data,
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        tagIds: Array.isArray(data.tagIds) 
          ? data.tagIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id)
          : []
      };
      await onSubmit(formattedData);
      onClose();
    } catch (err: any) {
      console.error('送信中にエラーが発生しました', err);
    }
  };

  const FormField = ({ name, rules, placeholder, type = 'text', disabled = false }: { name: keyof CustomFormData; rules: any; placeholder: string; type?: string; disabled?: boolean }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div>
          <Input {...field} type={type} placeholder={placeholder} value={field.value?.toString() ?? ''} disabled={disabled} />
          <ErrorMessage message={errors[name]?.message || ''} />
        </div>
      )}
    />
  );

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{client ? '取引先編集' : '新規取引先登録'}</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'カテゴリは必須です' }}
              render={({ field }) => (
                <div>
                  <p className="mb-2">カテゴリ</p>
                  <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage message={errors.categoryId?.message || ''} />
                </div>
              )}
            />
            {renderCompanyNameField()}

            <FormField name="address" rules={{ required: '所在地は必須です。' }} placeholder="所在地" />
            <FormField name="contactName" rules={{ required: '担当者名は必須です。' }} placeholder="担当者名" />
            <FormField
              name="contactEmail"
              rules={{
                required: 'メールアドレスは必須です。',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '有効なメールアドレスを入力してください。'
                }
              }}
              placeholder="担当者メールアドレス"
              type="email"
            />
            <FormField
              name="contactPhone"
              rules={{
                required: '電話番号は必須です。',
                pattern: {
                  value: /^(0\d{1,4}(-?\d{1,4}){2})$/,
                  message: '有効な電話番号を入力してください（例: 03-1234-5678 または 0312345678）。'
                }
              }}
              placeholder="担当者電話番号"
              type="tel"
            />
            <FormField name="registrationNumber" rules={{ required: '登録番号は必須です。' }} placeholder="登録番号" />
            <Controller
              name="tagIds"
              control={control}
              rules={{ required: '少なくとも1つのタグを選択してください。' }}
              render={({ field }) => (
                <div>
                  <p className="mb-2">タグを選択</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <TagChip
                        key={tag.id}
                        tag={tag}
                        isSelected={field.value.includes(tag.id)}
                        onToggle={(tagId) => {
                          const updatedTags = field.value.includes(tagId)
                            ? field.value.filter((id: number) => id !== tagId)
                            : [...field.value, tagId];
                          setValue('tagIds', updatedTags);
                        }}
                      />
                    ))}
                  </div>
                  <ErrorMessage message={errors.tagIds?.message || ''} />
                </div>
              )}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              キャンセル
            </Button>
            <Button type="submit">{client ? '更新' : '登録'}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ClientForm;