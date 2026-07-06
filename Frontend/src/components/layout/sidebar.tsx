'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import {
  LayoutDashboard, Receipt, ArrowRightLeft, Wallet, Users, BookOpen, 
  PiggyBank, BarChart3, Settings, Building2, ChevronLeft, LogOut,
  FileText, Banknote,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'FINANCE', 'ACCOUNTING', 'MANAGER', 'VIEWER'] },
  { href: '/accounts', label: 'Chart of Accounts', icon: BookOpen, roles: ['SUPER_ADMIN', 'FINANCE', 'ACCOUNTING', 'MANAGER', 'VIEWER'] },
  { href: '/contacts', label: 'Contacts', icon: Users, roles: ['SUPER_ADMIN', 'FINANCE', 'ACCOUNTING', 'MANAGER', 'VIEWER'] },
  { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft, roles: ['SUPER_ADMIN', 'FINANCE', 'ACCOUNTING', 'MANAGER', 'VIEWER'] },
  { href: '/invoices', label: 'Invoices', icon: Receipt, roles: ['SUPER_ADMIN', 'FINANCE', 'ACCOUNTING', 'MANAGER', 'VIEWER'] },
  { href: '/banks', label: 'Cash & Bank', icon: Banknote, roles: ['SUPER_ADMIN', 'FINANCE', 'ACCOUNTING', 'MANAGER', 'VIEWER'] },
  { href: '/journal', label: 'Journal Entries', icon: FileText, roles: ['SUPER_ADMIN', 'ACCOUNTING', 'MANAGER', 'VIEWER'] },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank, roles: ['SUPER_ADMIN', 'ACCOUNTING', 'MANAGER', 'VIEWER'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['SUPER_ADMIN', 'FINANCE', 'ACCOUNTING', 'MANAGER', 'VIEWER'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN', 'FINANCE', 'ACCOUNTING', 'MANAGER', 'VIEWER'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const visibleItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      className="fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground overflow-hidden"
    >
      <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Wallet className="h-6 w-6 text-sidebar-primary" />
              <span className="font-semibold text-sm">Sistem Keuangan</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}>
                <Icon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
