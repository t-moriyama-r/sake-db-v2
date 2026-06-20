'use client';

import type { SerializableLiquorHistoryRecord } from '@/lib/server/liquors/fetch';

type Props = {
  histories: SerializableLiquorHistoryRecord[];
  currentVersionNo: number;
  onSelectAction: (history: SerializableLiquorHistoryRecord) => void;
};

export function LiquorHistoryPanel({ histories, currentVersionNo, onSelectAction }: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-foreground">編集履歴</h2>
      {histories.length === 0 ? (
        <p className="text-sm text-foreground-secondary">履歴なし</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {histories.map((h) => (
            <HistoryItem
              key={h.id}
              history={h}
              isCurrent={h.versionNo === currentVersionNo}
              onSelectAction={onSelectAction}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

type HistoryItemProps = {
  history: SerializableLiquorHistoryRecord;
  isCurrent: boolean;
  onSelectAction: (history: SerializableLiquorHistoryRecord) => void;
};

function HistoryItem({ history: h, isCurrent, onSelectAction }: HistoryItemProps) {
  return (
    <li
      className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 transition-colors cursor-pointer hover:bg-surface-hover ${isCurrent ? 'bg-surface-hover' : ''}`}
      onClick={() => onSelectAction(h)}
    >
      <span className="flex items-center gap-2">
        <span className="text-sm font-bold text-foreground">v{h.versionNo}</span>
        {isCurrent && (
          <span className="text-xs font-medium px-1.5 py-0.5 rounded border border-border text-foreground-secondary">
            現在
          </span>
        )}
      </span>
      <span className="text-xs text-foreground-secondary">
        {new Date(h.updatedAt).toLocaleString('ja-JP')}
        {h.updateUserName && <span>（{h.updateUserName}）</span>}
      </span>
    </li>
  );
}
