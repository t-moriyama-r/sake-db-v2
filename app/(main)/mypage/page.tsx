import { redirect } from 'next/navigation';
import { MyPageView } from '@/components/pages/mypage/MyPageView/MyPageView';
import { routes } from '@/lib/routes';
import { fetchBookmarksSSR } from '@/lib/server/bookmarks/fetch';
import { getServerUserProfile } from '@/lib/server/auth';

export default async function MyPage() {
  const [userProfile, bookmarks] = await Promise.all([
    getServerUserProfile(),
    fetchBookmarksSSR(),
  ]);

  if (!userProfile) {
    redirect(routes.auth.login());
  }

  return <MyPageView userProfile={userProfile} bookmarks={bookmarks} />;
}
