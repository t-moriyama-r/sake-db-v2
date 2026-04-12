'use client';

import { useEffect, useRef } from 'react';
import { Button } from '../Button/Button';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export const Dialog = ({ open, onClose, title, children, actions }: DialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-surface rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
        )}
        <div className="flex-1 overflow-auto px-6 py-4">{children}</div>
        {actions && (
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">{actions}</div>
        )}
      </div>
    </div>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
};

export const ConfirmDialog = ({
  open, onClose, onConfirm, title = '確認', message, confirmLabel = '実行', loading,
}: ConfirmDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>キャンセル</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-foreground-secondary">{message}</p>
    </Dialog>
  );
}
