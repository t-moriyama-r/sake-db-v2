'use client';

import { useState } from 'react';

export function useActionError() {
  const [actionError, setActionError] = useState<string>('');

  const withActionError = async (fn: () => Promise<void>, fallback: string) => {
    setActionError('');
    try {
      await fn();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : fallback);
    }
  };

  return { actionError, withActionError };
}
