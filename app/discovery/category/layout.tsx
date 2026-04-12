import { Sidebar } from '@/components/layout/Sidebar/Sidebar';

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 h-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
    </div>
  );
}
