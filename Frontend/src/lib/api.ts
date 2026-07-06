import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface DashboardStats {
  revenue: number;
  expenses: number;
  netIncome: number;
  pendingInvoices: number;
  totalAccounts: number;
  totalContacts: number;
  monthlyCashIn: number;
  monthlyCashOut: number;
  overdueInvoices: number;
  pendingApprovals: number;
  recentTransactions: any[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  bankKas?: any;
  _count?: { transactions: number };
}

export interface Contact {
  id: string;
  type: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  balance: number;
  isActive: boolean;
  _count?: { invoices: number; transactions: number };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  contact: { id: string; name: string; email?: string };
  date: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  approvalStatus: string;
  items: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Transaction {
  id: string;
  transactionNo: string;
  type: string;
  date: string;
  amount: number;
  account: { id: string; code: string; name: string };
  targetAccount?: { id: string; code: string; name: string } | null;
  category?: { id: string; name: string } | null;
  contact?: { id: string; name: string } | null;
  paymentMethod: string;
  description?: string;
  approvalStatus: string;
  createdBy: { id: string; name: string };
}
