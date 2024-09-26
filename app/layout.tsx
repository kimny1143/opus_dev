import '../styles/globals.css';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Sidebar from '../components/ui/Sidebar';
import { AuthProvider } from './providers/AuthProvider';

export const metadata = {
  title: 'OPUS - Outsourcing Process Unification System',
  description: 'Manage your outsourcing processes efficiently',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <title>OPUS</title>
      </head>
      <body className="flex">
        <AuthProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4">{children}</main>
          <Footer />
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}