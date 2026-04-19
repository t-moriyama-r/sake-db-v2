'use client';

import type { SerializableCategoryRecord } from '@/lib/server/categories/fetch';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { LiquorFormFields } from './LiquorFormFields';
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
  const { save } = useLiquorSave(
    props.mode === 'EDIT' ? { liquor: props.liquor } : {},
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        {props.mode === 'EDIT' ? 'お酒を編集' : 'お酒を登録'}
      </h1>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <LiquorFormFields
          categories={props.categories}
          liquor={props.mode === 'EDIT' ? props.liquor : undefined}
          defaultValues={
            props.mode === 'EDIT'
              ? {
                  categoryId: props.liquor.categoryId,
                  name: props.liquor.name,
                  description: props.liquor.description ?? '',
                  youtube: props.liquor.youtube ?? '',
                }
              : { categoryId: props.categoryId }
          }
          onSubmitAction={save}
        />
      </div>
    </div>
  );
}
