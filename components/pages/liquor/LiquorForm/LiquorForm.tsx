'use client';

import { useState } from 'react';
import type { SerializableCategoryRecord } from '@/lib/server/categories/fetch';
import type { SerializableLiquorHistoryRecord, SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { LiquorFormFields } from './LiquorFormFields';
import { LiquorHistoryPanel } from './LiquorHistoryPanel';
import { useLiquorSave } from './useLiquorSave';

type NewProps = {
  mode: 'NEW';
  categories: SerializableCategoryRecord[];
  categoryId?: string;
};

type EditProps = {
  mode: 'EDIT';
  categories: SerializableCategoryRecord[];
  liquor: SerializableLiquorRecord;
  histories: SerializableLiquorHistoryRecord[];
};

type Props = NewProps | EditProps;

type RollbackValues = {
  categoryId: string;
  name: string;
  description: string;
  youtube: string;
  imageBase64?: string | null;
  version: number;
};

export function LiquorForm(props: Props) {
  const { save, saveError } = useLiquorSave(
    props.mode === 'EDIT' ? { liquor: props.liquor } : {},
  );

  const [rollbackValues, setRollbackValues] = useState<RollbackValues | null>(null);

  const handleRollback = (history: SerializableLiquorHistoryRecord) => {
    setRollbackValues((prev) => ({
      categoryId: history.categoryId,
      name: history.name,
      description: history.description ?? '',
      youtube: history.youtube ?? '',
      imageBase64: history.imageBase64 ?? null,
      version: (prev?.version ?? 0) + 1,
    }));
  };

  const isEdit = props.mode === 'EDIT';

  return (
    <div className={`mx-auto px-4 py-8 ${isEdit ? 'max-w-5xl' : 'max-w-2xl'}`}>
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        {isEdit ? 'お酒を編集' : 'お酒を登録'}
      </h1>
      <div className={isEdit ? 'grid gap-6 lg:grid-cols-[1fr_280px]' : undefined}>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <LiquorFormFields
            key={rollbackValues?.version ?? 'initial'}
            categories={props.categories}
            liquor={isEdit ? props.liquor : undefined}
            defaultValues={
              rollbackValues ??
              (isEdit
                ? {
                    categoryId: props.liquor.categoryId,
                    name: props.liquor.name,
                    description: props.liquor.description ?? '',
                    youtube: props.liquor.youtube ?? '',
                  }
                : { categoryId: props.categoryId })
            }
            initialImageBase64={rollbackValues?.imageBase64 ?? (isEdit ? props.liquor.imageBase64 : undefined)}
            onSubmitAction={save}
            saveError={saveError}
          />
        </div>
        {isEdit && (
          <LiquorHistoryPanel
            histories={props.histories}
            currentVersionNo={(props.liquor.versionNo ?? 1) - 1}
            onSelectAction={handleRollback}
          />
        )}
      </div>
    </div>
  );
}
