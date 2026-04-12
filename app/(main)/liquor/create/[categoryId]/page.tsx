'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import type { LiquorInput } from '@/schemas/liquor';
import { LiquorForm } from '@/components/liquor/LiquorForm/LiquorForm';

export default function LiquorCreatePage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();
  const { user, isLogin } = useAuth();

  if (!isLogin) {
    router.replace('/auth/login');
    return null;
  }

  const handleSubmit = async (data: LiquorInput) => {
    await client.models.Liquor.create({
      categoryId: data.categoryId || categoryId,
      categoryName: '',
      name: data.name,
      description: data.description ?? undefined,
      youtube: data.youtube ?? undefined,
      rate5Users: [],
      rate4Users: [],
      rate3Users: [],
      rate2Users: [],
      rate1Users: [],
      versionNo: 1,
      createUserId: user?.id,
      createUserName: user?.name,
      updateUserId: user?.id,
      updateUserName: user?.name,
    });
    router.push(`/discovery/category/${data.categoryId || categoryId}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">お酒を登録</h1>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <LiquorForm
          defaultValues={{ categoryId }}
          onSubmit={handleSubmit}
          submitLabel="登録する"
        />
      </div>
    </div>
  );
}
