'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { routes } from '@/lib/routes';

export function MyPageActions() {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      size="sm"
      className="mt-3"
      onClick={() => router.push(routes.mypage.edit())}
    >
      プロフィールを編集
    </Button>
  );
}
