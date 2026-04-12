import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AmplifyProvider } from '@/components/AmplifyProvider/AmplifyProvider';
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import { Header } from '@/components/layout/Header/Header';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'sake-db', template: '%s | sake-db' },
  description: 'お酒のデータベース・コミュニティサイト',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex h-full flex-col bg-background text-foreground overflow-hidden">
        <ThemeProvider>
          <AmplifyProvider>
            <Header />
            <main className="flex-1 overflow-hidden">{children}</main>
          </AmplifyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
