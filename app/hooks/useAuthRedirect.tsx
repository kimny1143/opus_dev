'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';

const useAuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('auth_token'); // クッキー名を統一
    if (!token) {
      router.push('/login');
    }
  }, [router]);
};

export default useAuthRedirect;