import '../styles/globals.css';
import { AuthProvider } from './providers/AuthProvider';
import Header from '@/app/components/ui/Header';
import Footer from '@/app/components/ui/Footer';
import Sidebar from '@/app/components/ui/Sidebar';
import { Button } from '@/app/components/ui/Button';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { Select } from '@/app/components/ui/Select';
import { Input, Card, CardHeader, CardContent } from '@/app/components/ui/opus-components';

export const metadata = {
  title: 'OPUS - Outsourcing Process Unification System',
  description: 'Manage your outsourcing processes efficiently',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex">
        <AuthProvider>
          <div className="flex w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-4">{children}</main>
              <Footer />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}