import React from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/app/components/ui/Button';

const Header: React.FC = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">OPUS</h1>
        <Button onClick={logout} size="sm">ログアウト</Button>
      </div>
    </header>
  );
};

export default Header;