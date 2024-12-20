// types/form.ts
export interface CustomFormData {
    companyName: string;
    address: string;
    contactName?: string;
    contactEmail: string;
    contactPhone: string;
    hasInvoiceRegistration: boolean;
    registrationNumber?: string;
    categoryId: number | null;
    tagIds: number[];
    // 追加フィールド
    status?: 'active' | 'inactive';
}

// ユーティリティ型を利用して型安全性を向上
export type RequiredFormData = Required<Omit<CustomFormData, 'status'>>;