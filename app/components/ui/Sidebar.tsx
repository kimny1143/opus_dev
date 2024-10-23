'use client';

import React from 'react';
import Link from 'next/link';
import { FiHome, FiUsers, FiBox, FiFileText } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  
  const menuItems = [
    { href: '/dashboard', label: 'ダッシュボード', icon: <FiHome /> },
    { href: '/clients', label: '取引先管理', icon: <FiUsers /> },
    { href: '/orders', label: '発注管理', icon: <FiBox /> },
    { href: '/invoices', label: '請求書管理', icon: <FiFileText /> },
  ];

  return (
    <aside className="w-64 bg-gray-100 h-screen shadow-md">
      <nav className="px-4 py-6">
        <ul>
          {menuItems.map((item) => (
            <li key={item.href} className="mb-4">
              <Link href={item.href} legacyBehavior>
                <a className={`flex items-center ${pathname === item.href ? 'text-blue-500' : 'text-gray-700 hover:text-gray-900'}`}>
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;