import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    PAID: 'text-green-600 bg-green-50 border-green-200',
    UNPAID: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    OVERDUE: 'text-red-600 bg-red-50 border-red-200',
    DRAFT: 'text-gray-600 bg-gray-50 border-gray-200',
    SENT: 'text-blue-600 bg-blue-50 border-blue-200',
    PARTIALLY_PAID: 'text-orange-600 bg-orange-50 border-orange-200',
    CANCELLED: 'text-red-600 bg-red-50 border-red-200',
    PENDING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    APPROVED: 'text-green-600 bg-green-50 border-green-200',
    REJECTED: 'text-red-600 bg-red-50 border-red-200',
    ACTIVE: 'text-green-600 bg-green-50 border-green-200',
    COMPLETED: 'text-blue-600 bg-blue-50 border-blue-200',
    ON_HOLD: 'text-orange-600 bg-orange-50 border-orange-200',
  };
  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
}
