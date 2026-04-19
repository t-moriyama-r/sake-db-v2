import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ConfirmDialog } from '@/components/ui/Dialog/Dialog';
import { useLiquorDelete } from '../hooks/useLiquorDelete';

type Props = {
  liquorId: string;
  categoryId: string;
  liquorName: string;
  deletable: boolean;
  onEditAction: () => void;
};

export function LiquorActions({ liquorId, categoryId, liquorName, deletable, onEditAction }: Props) {
  const { deleteDialog, setDeleteDialog, deleting, handleDelete } = useLiquorDelete({ liquorId, categoryId });

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEditAction}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="編集"
        >
          <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
        </button>
        {deletable && (
          <button
            type="button"
            onClick={() => setDeleteDialog(true)}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="削除"
          >
            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
          </button>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="お酒を削除"
        message={`「${liquorName}」を削除してもよろしいですか？この操作は取り消せません。`}
        confirmLabel="削除する"
        loading={deleting}
      />
    </>
  );
}
