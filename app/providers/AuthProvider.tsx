'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import instance from '@/lib/api';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await instance.get('/api/auth/me');
        if (res.status === 200) {
          setUser(res.data.user);
          console.log('Fetched user:', res.data.user);
        }
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await instance.post('/api/auth/login', {
        email,
        password
      });

      if (response.status === 200) {
        setUser(response.data.user);
        router.push('/dashboard');
      } else {
        throw new Error('ログインに失敗しました');
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await instance.post('/api/auth/logout');
      if (response.status === 200) {
        setUser(null);
        router.push('/login');
      } else {
        throw new Error('ログアウトに失敗しました');
      }
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await instance.post('/api/auth/register', {
        name,
        email,
        password
      });

      if (response.status === 200) {
        setUser(response.data.user);
        router.push('/dashboard');
      } else {
        throw new Error('登録に失敗しました');
      }
    } catch (error) {
      console.error('登録エラー:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};