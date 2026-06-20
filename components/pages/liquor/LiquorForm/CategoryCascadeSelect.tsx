import type { SerializableCategoryRecord } from '@/lib/server/categories/fetch';

type Props = {
  categories: SerializableCategoryRecord[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
};

export function CategoryCascadeSelect({ categories, value, onChange, error }: Props) {
  const selectedPath = value && categories.length > 0 ? findPath(categories, value) : [];
  const levels = computeLevels(categories, selectedPath);

  const handleChange = (level: number, id: string) => {
    if (!id) {
      // 「選択」に戻した場合は一つ上のレベルのIDを使う（なければ空）
      onChange(selectedPath[level - 1] ?? '');
      return;
    }
    onChange(id);
  };

  return (
    <div className="flex flex-col gap-2">
      {levels.map((levelCategories, index) => (
        <select
          key={index}
          className={SELECT_CLASS}
          value={selectedPath[index] ?? ''}
          onChange={(e) => handleChange(index, e.target.value)}
        >
          <option value="">-- 選択 --</option>
          {sortWithOtherLast(levelCategories).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      ))}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
const SELECT_CLASS =
  'w-full rounded-md border border-border-input bg-surface px-3 py-2 text-sm text-foreground ' +
  'focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring';

function getChildren(categories: SerializableCategoryRecord[], parentId: string): SerializableCategoryRecord[] {
  return categories.filter((c) => c.parentId === parentId);
}

function computeLevels(categories: SerializableCategoryRecord[], selectedPath: string[]): SerializableCategoryRecord[][] {
  const roots = categories.filter((c) => !c.parentId);
  if (roots.length === 0) return [];

  const levels: SerializableCategoryRecord[][] = [roots];
  for (const id of selectedPath) {
    const children = getChildren(categories, id);
    if (children.length === 0) break;
    levels.push(children);
  }

  return levels;
}

function findPath(categories: SerializableCategoryRecord[], targetId: string): string[] {
  const target = categories.find((c) => c.id === targetId);
  if (!target) return [];
  if (!target.parentId) return [target.id];
  const parentPath = findPath(categories, target.parentId);
  return [...parentPath, target.id];
}

function sortWithOtherLast(categories: SerializableCategoryRecord[]): SerializableCategoryRecord[] {
  return [...categories].sort((a, b) => {
    if (a.name === 'その他') return 1;
    if (b.name === 'その他') return -1;
    return 0;
  });
}
