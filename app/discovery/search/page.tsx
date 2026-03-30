import { Suspense } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { SearchContent } from '@/components/search/SearchContent';
import { Spinner } from '@/components/ui/Spinner';

export default function SearchPage() {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <Suspense fallback={<div className="flex-1 min-w-0 flex justify-center py-16"><Spinner size="lg" /></div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
