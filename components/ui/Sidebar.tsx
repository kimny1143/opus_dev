import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-100 h-screen shadow-md">
      <nav className="px-4 py-6">
        <ul>
          <li className="mb-4">
            <Link href="/">
              <span className="text-gray-700 hover:text-gray-900">ダッシュボード</span>
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/clients">
              <span className="text-gray-700 hover:text-gray-900">取引先管理</span>
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/orders">
              <span className="text-gray-700 hover:text-gray-900">受発注管理</span>
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/invoices">
              <span className="text-gray-700 hover:text-gray-900">請求書管理</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;