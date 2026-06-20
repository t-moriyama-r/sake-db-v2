import { Sidebar } from '@/components/layout/Sidebar/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4">
      <Sidebar />
      <div className="flex-1 min-w-0 py-8">{children}</div>
    </div>
  );
}
