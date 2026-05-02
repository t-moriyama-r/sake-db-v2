'use client';

import { useEffect, useRef, useState } from 'react';
import type { SerializableCategoryRecord } from '@/lib/server/categories/fetch';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { fetchLiquorHistories, type LiquorHistoryRecord } from '@/lib/repository/liquor';
import { LiquorFormFields, type LiquorFormFieldsRef } from './LiquorFormFields';
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
};

type Props = NewProps | EditProps;

export function LiquorForm(props: Props) {
  const { save, saveError } = useLiquorSave(
    props.mode === 'EDIT' ? { liquor: props.liquor } : {},
  );

  const formRef = useRef<LiquorFormFieldsRef>(null);
  const [histories, setHistories] = useState<LiquorHistoryRecord[]>([]);

  useEffect(() => {
    if (props.mode !== 'EDIT') return;
    fetchLiquorHistories(props.liquor.id).then(setHistories).catch(() => {
      console.warn('編集履歴の取得に失敗しました');
    });
  }, [props.mode, props.mode === 'EDIT' ? props.liquor.id : null]);

  const handleRollback = (history: LiquorHistoryRecord) => {
    formRef.current?.resetToValues({
      categoryId: history.categoryId,
      name: history.name,
      description: history.description ?? '',
      youtube: history.youtube ?? '',
      imageBase64: history.imageBase64,
    });
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
            ref={formRef}
            categories={props.categories}
            liquor={isEdit ? props.liquor : undefined}
            defaultValues={
              isEdit
                ? {
                    categoryId: props.liquor.categoryId,
                    name: props.liquor.name,
                    description: props.liquor.description ?? '',
                    youtube: props.liquor.youtube ?? '',
                  }
                : { categoryId: props.categoryId }
            }
            onSubmitAction={save}
            saveError={saveError}
          />
        </div>
        {isEdit && (
          <LiquorHistoryPanel
            histories={histories}
            currentVersionNo={props.liquor.versionNo ?? 0}
            onSelectAction={handleRollback}
          />
        )}
      </div>
    </div>
  );
}
