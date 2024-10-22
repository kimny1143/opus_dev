'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthStatus } from '@/app/utils/auth';

const useAuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await checkAuthStatus();
      console.log('Auth status:', authStatus);
      if (!authStatus || !authStatus.user) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);
};

export default useAuthRedirect;