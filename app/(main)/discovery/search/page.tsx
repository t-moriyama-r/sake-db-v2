import { Suspense } from 'react';
import { SearchContent } from '@/components/pages/search/SearchContent/SearchContent';
import { Spinner } from '@/components/ui/Spinner/Spinner';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner size="lg" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
