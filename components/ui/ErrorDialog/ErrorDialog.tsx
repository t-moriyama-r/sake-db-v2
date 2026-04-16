'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';

export function ErrorDialogProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');

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
        <p className="text-foreground-secondary">{message}</p>
      </Dialog>
    </>
  );
}
