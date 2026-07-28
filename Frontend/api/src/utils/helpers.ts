import { v4 as uuidv4 } from 'uuid';

export function generateInvoiceNumber(prefix: string): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${y}${m}${d}-${rand}`;
}

export function generateTransactionNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `TRX-${y}${m}${d}-${rand}`;
}

export function generateJournalEntryNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `JE-${y}${m}-${rand}`;
}

export function calculatePpn(amount: number, rate: number = 11): number {
  return amount * (rate / 100);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parsePagination(query: any): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export function buildDateFilter(startDate?: string, endDate?: string): { gte?: Date; lte?: Date } {
  const filter: { gte?: Date; lte?: Date } = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.lte = end;
  }
  return filter;
}
