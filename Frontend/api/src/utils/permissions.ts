import { Role } from '@prisma/client';

type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

type ModulePermissions = Record<string, Permission>;

const permissions: Record<Role, ModulePermissions> = {
  SUPER_ADMIN: {
    Dashboard: { create: false, read: true, update: false, delete: false },
    Accounts: { create: true, read: true, update: true, delete: true },
    Contacts: { create: true, read: true, update: true, delete: true },
    CashBank: { create: true, read: true, update: true, delete: true },
    Transactions: { create: true, read: true, update: true, delete: true },
    Invoices: { create: true, read: true, update: true, delete: true },
    JournalEntries: { create: true, read: true, update: true, delete: true },
    Budgets: { create: true, read: true, update: true, delete: true },
    Reports: { create: false, read: true, update: false, delete: false },
    Settings: { create: true, read: true, update: true, delete: true },
    AuditLogs: { create: false, read: true, update: false, delete: false },
  },
  FINANCE: {
    Dashboard: { create: false, read: true, update: false, delete: false },
    Accounts: { create: false, read: true, update: false, delete: false },
    Contacts: { create: true, read: true, update: true, delete: false },
    CashBank: { create: true, read: true, update: true, delete: false },
    Transactions: { create: true, read: true, update: true, delete: false },
    Invoices: { create: true, read: true, update: true, delete: false },
    JournalEntries: { create: false, read: false, update: false, delete: false },
    Budgets: { create: false, read: false, update: false, delete: false },
    Reports: { create: false, read: true, update: false, delete: false },
    Settings: { create: false, read: true, update: false, delete: false },
    AuditLogs: { create: false, read: false, update: false, delete: false },
  },
  ACCOUNTING: {
    Dashboard: { create: false, read: true, update: false, delete: false },
    Accounts: { create: true, read: true, update: true, delete: false },
    Contacts: { create: true, read: true, update: true, delete: false },
    CashBank: { create: true, read: true, update: true, delete: false },
    Transactions: { create: true, read: true, update: true, delete: false },
    Invoices: { create: true, read: true, update: true, delete: false },
    JournalEntries: { create: true, read: true, update: true, delete: false },
    Budgets: { create: true, read: true, update: true, delete: false },
    Reports: { create: false, read: true, update: false, delete: false },
    Settings: { create: false, read: true, update: false, delete: false },
    AuditLogs: { create: false, read: false, update: false, delete: false },
  },
  MANAGER: {
    Dashboard: { create: false, read: true, update: false, delete: false },
    Accounts: { create: false, read: true, update: false, delete: false },
    Contacts: { create: false, read: true, update: false, delete: false },
    CashBank: { create: false, read: true, update: false, delete: false },
    Transactions: { create: true, read: true, update: false, delete: false },
    Invoices: { create: true, read: true, update: false, delete: false },
    JournalEntries: { create: false, read: true, update: false, delete: false },
    Budgets: { create: true, read: true, update: true, delete: false },
    Reports: { create: false, read: true, update: false, delete: false },
    Settings: { create: false, read: true, update: false, delete: false },
    AuditLogs: { create: false, read: true, update: false, delete: false },
  },
  VIEWER: {
    Dashboard: { create: false, read: true, update: false, delete: false },
    Accounts: { create: false, read: true, update: false, delete: false },
    Contacts: { create: false, read: true, update: false, delete: false },
    CashBank: { create: false, read: true, update: false, delete: false },
    Transactions: { create: false, read: true, update: false, delete: false },
    Invoices: { create: false, read: true, update: false, delete: false },
    JournalEntries: { create: false, read: true, update: false, delete: false },
    Budgets: { create: false, read: true, update: false, delete: false },
    Reports: { create: false, read: true, update: false, delete: false },
    Settings: { create: false, read: true, update: false, delete: false },
    AuditLogs: { create: false, read: false, update: false, delete: false },
  },
};

export function checkPermission(role: Role, module: string, action: Action): boolean {
  const modPerms = permissions[role][module];
  if (!modPerms) return false;
  return modPerms[action.toLowerCase() as keyof Permission] ?? false;
}

export function getPermissions(role: Role): ModulePermissions {
  return { ...permissions[role] };
}
