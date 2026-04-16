import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AmplifyProvider } from '@/components/AmplifyProvider/AmplifyProvider';
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import { Header } from '@/components/layout/Header/Header';
import { MobileSidebarProvider } from '@/components/layout/Sidebar/MobileSidebarContext';
import { ErrorDialogProvider } from '@/components/ui/ErrorDialog/ErrorDialog';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'sake-db', template: '%s | sake-db' },
  description: 'お酒のデータベース・コミュニティサイト',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} antialiased`} suppressHydrationWarning>
      <body className="flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <AmplifyProvider>
            <ErrorDialogProvider>
              <MobileSidebarProvider>
                <Header />
                <main className="flex-1">{children}</main>
              </MobileSidebarProvider>
            </ErrorDialogProvider>
          </AmplifyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
