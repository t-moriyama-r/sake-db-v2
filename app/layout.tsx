import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import AmplifyProvider from '@/components/AmplifyProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'sake-db', template: '%s | sake-db' },
  description: 'お酒のデータベース・コミュニティサイト',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-gray-50">
        <AmplifyProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AmplifyProvider>
      </body>
    </html>
  );
}
