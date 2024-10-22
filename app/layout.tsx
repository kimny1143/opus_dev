import '../styles/globals.css';
import { AuthProvider } from './providers/AuthProvider';

export const metadata = {
  title: 'OPUS - Outsourcing Process Unification System',
  description: 'Manage your outsourcing processes efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}