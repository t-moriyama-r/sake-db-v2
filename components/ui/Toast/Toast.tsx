'use client';

import { type Toast } from '@/hooks/useToast';

const typeClasses = {
  success: 'bg-success text-success-foreground',
  error: 'bg-destructive text-destructive-foreground',
  info: 'bg-primary text-primary-foreground',
};

type Props = {
  toasts: Toast[];
  onRemove: (id: string) => void;
};

export const ToastContainer = ({ toasts, onRemove }: Props) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${typeClasses[toast.type]} max-w-sm`}
        >
          <span className="flex-1 text-sm">{toast.message}</span>
          <button
            type="button"
            onClick={() => onRemove(toast.id)}
            className="opacity-80 hover:opacity-100"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
