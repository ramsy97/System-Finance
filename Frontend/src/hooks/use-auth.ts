'use client';

import { useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      api.get('/auth/me')
        .then((res) => {
          const u = res.data.data;
          login(u, token);
        })
        .catch(() => {
          logout();
        });
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data.data;
    login(userData, token);
    return userData;
  };

  const signOut = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
  };

  return { user, isAuthenticated, signIn, signOut };
}
