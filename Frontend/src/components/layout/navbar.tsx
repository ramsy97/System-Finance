'use client';

import { Bell, LogOut, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { getInitials, formatDateShort } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function Navbar() {
  const { user } = useAuthStore();
  const { signOut } = useAuth();
  const { toggleSidebar } = useUIStore();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const res = await api.get('/reports/notifications'); return res.data; },
    refetchInterval: 30000,
  });

  const notifications = notifData?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden md:flex items-center flex-1 max-w-md">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search transactions, invoices..."
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative" ref={notifRef}>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-1 z-50 w-80 rounded-lg border bg-popover shadow-lg">
                <div className="flex items-center justify-between p-3 border-b">
                  <p className="text-sm font-semibold">Notifications</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNotifications(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n: any) => (
                      <div key={n.id} className={`p-3 border-b text-sm hover:bg-muted/50 ${!n.isRead ? 'bg-primary/5' : ''}`}>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatDateShort(n.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 10 && (
                  <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="text-xs w-full">View all</Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setShowDropdown(!showDropdown)}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{user ? getInitials(user.name) : 'U'}</AvatarFallback>
              </Avatar>
            </Button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border bg-popover p-2 shadow-lg">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                  <div className="border-t my-1" />
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
