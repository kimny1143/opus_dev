// lib/types.ts

// Client
export interface Client {
  id: number;
  companyName: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  hasInvoiceRegistration: boolean;
  registrationNumber?: string;
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

export interface ClientPageProps {
  params: {
    id: string;
  };
}



// Order
export interface Order {
  id: number;
  orderNumber: string; 
  client: Client;
  issueDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}


// OrderFormData
export interface OrderFormData {
  orderNumber: string;
  clientId: number;
  issueDate: string;
  dueDate: string;
  status: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface OrderFormProps {
  initialData?: OrderFormData;
  onSubmit: (data: OrderFormData) => void;
  submitButtonLabel: string;
}


// InvoiceItem
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

// Invoice
export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number;
  issueDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  order: Order & {
    client: Client;
  };
  issuerClient?: Client;
  recipientClient?: Client;
  items: InvoiceItem[];
}

// InvoiceFormData
export interface InvoiceFormData {
  invoiceNumber: string;
  orderId: number;
  issueDate: string;
  dueDate: string;
  status: string;
  items: InvoiceItem[];
}

// ExtendedInvoiceFormData
export interface ExtendedInvoiceFormData extends InvoiceFormData {
  direction: 'client_to_user' | 'user_to_client';
}


export interface InvoiceFormProps {
  initialData?: {
    orderId: number;
    issueDate: string;
    dueDate: string;
    status: string;
    direction: 'client_to_user' | 'user_to_client';
    items: InvoiceItem[];
  };
  clients: Client[];
  orders: Order[];
  onSubmit: (data: ExtendedInvoiceFormData) => void;
}

// Category
export interface Category {
  id: number;
  name: string;
}

// ErrorMessage
export interface ErrorMessageProps {
  message: string;
}

// Tag
export interface Tag {
  id: number;
  name: string;
}

export interface TagChipProps {
  tag: Tag;
  isSelected: boolean;
  onToggle: (tagId: number) => void;
}

// Modal
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Table
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

