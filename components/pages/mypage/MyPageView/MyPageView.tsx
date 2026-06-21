import Image from 'next/image';
import { LiquorCard } from '@/components/pages/liquor/LiquorCard/LiquorCard';
import type { ServerUserProfile } from '@/lib/server/auth';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { MyPageActions } from './MyPageActions';

type Props = {
  userProfile: ServerUserProfile;
  bookmarks: SerializableLiquorRecord[];
};

export function MyPageView({ userProfile, bookmarks }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-start gap-4">
        {userProfile.imageBase64 ? (
          <Image src={userProfile.imageBase64} alt={userProfile.name} width={80} height={80} className="h-20 w-20 rounded-full object-cover" unoptimized />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-avatar-bg text-2xl font-bold text-avatar-fg">
            {userProfile.name?.[0] ?? '?'}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{userProfile.name}</h1>
          <p className="text-sm text-muted-foreground">{userProfile.email}</p>
          {userProfile.profile && <p className="mt-2 text-foreground-secondary">{userProfile.profile}</p>}
          <MyPageActions />
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">ブックマーク ({bookmarks.length}件)</h2>
        {bookmarks.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">ブックマークはまだありません</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bookmarks.map((liquor) => (
              <LiquorCard key={liquor.id} liquor={liquor} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
