import { Button } from '@/components/ui/Button/Button';

type Props = {
  isAdmin: boolean;
  onEditAction: () => void;
  onDeleteAction: () => void;
};

export function LiquorActions({ isAdmin, onEditAction, onDeleteAction }: Props) {

  return (
    <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onEditAction}>
          編集
        </Button>
      {isAdmin && (
        <Button variant="danger" size="sm" onClick={onDeleteAction}>
          削除
        </Button>
      )}
    </div>
  );
}
