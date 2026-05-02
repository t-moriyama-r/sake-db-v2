'use client';

import type { LiquorHistoryRecord } from '@/lib/repository/liquor';

type Props = {
  histories: LiquorHistoryRecord[];
  currentVersionNo: number;
  onSelectAction: (history: LiquorHistoryRecord) => void;
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
  history: LiquorHistoryRecord;
  isCurrent: boolean;
  onSelectAction: (history: LiquorHistoryRecord) => void;
};

function HistoryItem({ history: h, isCurrent, onSelectAction }: HistoryItemProps) {
  return (
    <li
      className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 cursor-pointer hover:bg-surface-hover transition-colors ${isCurrent ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={() => onSelectAction(h)}
    >
      <span className="text-sm font-bold text-foreground">v{h.versionNo}</span>
      <span className="text-xs text-foreground-secondary">
        {new Date(h.updatedAt).toLocaleString('ja-JP')}
        {h.updateUserName && <span>（{h.updateUserName}）</span>}
      </span>
    </li>
  );
}
