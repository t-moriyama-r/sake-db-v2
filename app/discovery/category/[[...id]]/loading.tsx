import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="flex flex-1 min-w-0 items-center justify-center py-16">
      <Spinner size="lg" />
    </div>
  );
}
