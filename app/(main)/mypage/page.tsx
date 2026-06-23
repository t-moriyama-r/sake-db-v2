import { redirect } from 'next/navigation';
import { MyPageView } from '@/components/pages/mypage/MyPageView/MyPageView';
import { routes } from '@/lib/routes';
import { getServerUserProfile } from '@/lib/server/auth';
import { fetchBookmarksSSR } from '@/lib/server/bookmarks/fetch';

export default async function MyPage() {
  const [userProfile, bookmarks] = await Promise.all([
    getServerUserProfile(),
    fetchBookmarksSSR(),
  ]);

  if (!userProfile) return redirect(routes.auth.login());

  return <MyPageView userProfile={userProfile} bookmarks={bookmarks} />;
}
