import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['SUPER_ADMIN', 'FINANCE', 'ACCOUNTING', 'MANAGER', 'VIEWER']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPER_ADMIN', 'FINANCE', 'ACCOUNTING', 'MANAGER', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
});

export const createAccountSchema = z.object({
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  description: z.string().optional(),
  balance: z.number().optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createContactSchema = z.object({
  type: z.enum(['CUSTOMER', 'SUPPLIER', 'VENDOR']),
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
});

export const updateContactSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const createInvoiceSchema = z.object({
  type: z.enum(['SALES', 'PURCHASE']),
  contactId: z.string().uuid(),
  date: z.string().datetime().or(z.string()),
  dueDate: z.string().datetime().or(z.string()),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0),
    amount: z.number().min(0),
  })).min(1),
});

export const createTransactionSchema = z.object({
  type: z.enum(['CASH_IN', 'CASH_OUT', 'TRANSFER']),
  date: z.string().datetime().or(z.string()),
  amount: z.number().positive(),
  accountId: z.string().uuid(),
  targetAccountId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  contactId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  paymentMethod: z.enum(['CASH', 'TRANSFER', 'QRIS', 'VIRTUAL_ACCOUNT', 'CREDIT_CARD']).optional(),
  referenceNo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const createJournalEntrySchema = z.object({
  date: z.string().datetime().or(z.string()),
  type: z.enum(['GENERAL', 'ADJUSTMENT']).optional(),
  description: z.string().optional().nullable(),
  items: z.array(z.object({
    accountId: z.string().uuid(),
    debit: z.number().min(0),
    credit: z.number().min(0),
    description: z.string().optional().nullable(),
    contactId: z.string().uuid().optional().nullable(),
    projectId: z.string().uuid().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
  })).min(2),
});

export const createBudgetSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12).optional().nullable(),
  amount: z.number().positive(),
  categoryId: z.string().uuid(),
  departmentId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
});

export const updateSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  logoUrl: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  taxRate: z.number().min(0).max(100).optional(),
  invoicePrefix: z.string().min(1).optional(),
  emailSmtpHost: z.string().optional().nullable(),
  emailSmtpPort: z.number().int().optional().nullable(),
  emailSmtpUser: z.string().optional().nullable(),
  emailSmtpPass: z.string().optional().nullable(),
  waApiUrl: z.string().optional().nullable(),
  waApiKey: z.string().optional().nullable(),
});
