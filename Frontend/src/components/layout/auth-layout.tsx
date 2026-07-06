'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [isLoginPage, isAuthenticated, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div style={{ marginLeft: sidebarOpen ? 260 : 72 }} className="transition-all duration-300">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
