// app/(authenticated)/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { useEffect } from 'react';
import Header from '@ui/Header';
import Sidebar from '@ui/Sidebar';

export default function AuthenticatedLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    const { user, loading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);
  
    if (loading) {
      return <p>読み込み中...</p>;
    }
  
    return (
      <>
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </>
    );
  }