'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { routes } from '@/lib/routes';

export function XCompleteView() {
  const router = useRouter();
  const { loginWithX } = useAuth();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/x/session');
        if (!res.ok) throw new Error('session');
        const { username, xUserId } = await res.json() as { username: string; xUserId: string };

        await loginWithX(username, xUserId);
        router.push(routes.home());
        router.refresh();
      } catch {
        setError('Xログインに失敗しました。もう一度お試しください。');
      }
    })();
  }, [loginWithX, router]);

  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-surface p-6 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <p className="text-muted-foreground">Xアカウントで認証中...</p>
  );
}

