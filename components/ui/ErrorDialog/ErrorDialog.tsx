'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Dialog } from '@/components/ui/Dialog/Dialog';

type Props = {
<<<<<<< Updated upstream
  children: ReactNode;
=======
  children: React.ReactNode;
>>>>>>> Stashed changes
};

export function ErrorDialogProvider({ children }: Props) {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const msg = event.reason instanceof Error
        ? event.reason.message
        : '予期しないエラーが発生しました';
      setMessage(msg);
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  const handleClose = () => setMessage('');

  return (
    <>
      {children}
      <Dialog
        open={!!message}
        onClose={handleClose}
        title="エラー"
        actions={<Button onClick={handleClose}>閉じる</Button>}
      >
        <p className="text-red-600">{message}</p>
      </Dialog>
    </>
  );
}
