'use client';

import { useAuth } from '@/hooks/useAuth';
import { GuestMenu } from './GuestMenu';
import { UserAccountMenu } from './UserAccountMenu';

export const HeaderUserMenu = () => {
  const { user, isLogin, isAdmin, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="h-8 w-24 animate-pulse rounded bg-muted" />;
  }

  if (isLogin) {
    return <UserAccountMenu user={user} isAdmin={isAdmin} logoutAction={logout} />;
  }

  return <GuestMenu />;
};
