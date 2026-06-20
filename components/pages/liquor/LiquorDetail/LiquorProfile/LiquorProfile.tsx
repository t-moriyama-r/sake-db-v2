'use client';

import { useRouter } from 'next/navigation';
import type { TagItem } from '@/components/pages/liquor/LiquorDetail/hooks/useLiquorTags';
import { routes } from '@/lib/routes';
import { extractYoutubeEmbedId } from '@/lib/liquor/youtube';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { LiquorActions } from './LiquorActions';
import { LiquorImage } from './LiquorImage';
import { LiquorInfo } from './LiquorInfo';
import { LiquorTagSection } from './LiquorTagSection/LiquorTagSection';
import { LiquorYoutube } from './LiquorYoutube';

type Props = {
  liquor: SerializableLiquorRecord;
  initialTags: TagItem[];
  isLogin: boolean;
};

export function LiquorProfile({ liquor, initialTags, isLogin }: Props) {
  const router = useRouter();

  const youtubeEmbedId = extractYoutubeEmbedId(liquor.youtube);

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="shrink-0">
          <LiquorImage
            imageBase64={liquor.imageBase64}
            imageUrl={liquor.imageUrl}
            name={liquor.name}
          />
        </div>

        <div className="flex-1">
          <LiquorInfo
            liquor={liquor}
            actions={
              <LiquorActions
                liquorId={liquor.id}
                categoryId={liquor.categoryId}
                liquorName={liquor.name}
                deletable={isLogin}
                onEditAction={() => router.push(routes.liquor.edit(liquor.id))}
              />
            }
          />

          <LiquorTagSection
            liquorId={liquor.id}
            initialTags={initialTags}
          />
        </div>
      </div>

      {youtubeEmbedId && (
        <LiquorYoutube youtubeEmbedId={youtubeEmbedId} title={liquor.name} />
      )}
    </>
  );
}
