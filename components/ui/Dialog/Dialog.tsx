'use client';

import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button/Button';
import { useDialogFocus } from './useDialogFocus';
import { useScrollLock } from './useScrollLock';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export const Dialog = ({ open, onClose, title, children, actions }: Props) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useScrollLock(open);
  const { dialogRef } = useDialogFocus({ open, onClose });

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="bg-surface rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="ダイアログを閉じる"
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto px-6 py-4">{children}</div>
        {actions && (
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">{actions}</div>
        )}
      </div>
    </div>,
    document.body
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
  errorMessage?: string;
};

export const ConfirmDialog = ({
  open, onClose, onConfirm, title = '確認', message, confirmLabel = '実行', loading, errorMessage,
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
      {errorMessage && (
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      )}
    </Dialog>
  );
}
