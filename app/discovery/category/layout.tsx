import { Sidebar } from '@/components/layout/Sidebar';

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      {children}
    </div>
  );
}
