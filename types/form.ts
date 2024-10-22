    // Start of Selection
    // types/form.ts

    import { Category, Tag } from '@prisma/client';

    export interface CustomFormData {
        companyName?: string | null;
        address: string;
        contactName: string;
        contactEmail: string;
        contactPhone: string;
        registrationNumber: string;
        categoryId: number | null;
        tagIds: number[];
        // 追加フィールド
        status?: 'active' | 'inactive';
    }

    // ユーティリティ型を利用して型安全性を向上
    export type RequiredFormData = Required<Omit<CustomFormData, 'status'>>;