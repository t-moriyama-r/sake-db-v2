'use client';

import { useState } from 'react';

export function useActionError() {
  const [actionError, setActionError] = useState<string>('');

  const withActionError = async (fn: () => Promise<void>, fallback: string) => {
    setActionError('');
    try {
      await fn();
    } catch (err: unknown) {
      console.error(
        'アクション実行に失敗しました:',
        err instanceof Error ? err.message : String(err),
      );
      setActionError(fallback);
    }
  };

  return { actionError, withActionError };
}
