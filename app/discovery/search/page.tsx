import { Suspense } from 'react';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { SearchContent } from '@/components/search/SearchContent/SearchContent';
import { Spinner } from '@/components/ui/Spinner/Spinner';

export default function SearchPage() {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 h-full overflow-hidden">
      <Sidebar />
      <Suspense fallback={<div className="flex-1 min-w-0 flex justify-center py-16"><Spinner size="lg" /></div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
