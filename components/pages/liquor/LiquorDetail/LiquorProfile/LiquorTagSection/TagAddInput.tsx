'use client';

import { useState, useTransition } from 'react';
import { Dialog } from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';

type Props = {
  open: boolean;
  onClose: () => void;
  onAddAction: (text: string) => Promise<void>;
};

export function TagAddInput({ open, onClose, onAddAction }: Props) {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      try {
        await onAddAction(value);
        setValue('');
        setError(null);
        onClose();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '追加に失敗しました');
      }
    });
  }

  function handleClose() {
    setValue('');
    setError(null);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="タグを追加"
      actions={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>キャンセル</Button>
          <Button onClick={() => void handleAdd()} loading={loading}>追加</Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="タグ名を入力..."
          autoFocus
          className="rounded-md border border-border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleAdd();
            }
          }}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </Dialog>
  );
}
