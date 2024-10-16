export interface Client {
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
      name: string;
    };
    tags: {
      tag: {
        name: string;
      };
    }[];
  }