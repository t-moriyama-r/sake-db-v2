'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm/LoginForm';
import { Button } from '@/components/ui/Button/Button';
import { Dialog } from '@/components/ui/Dialog/Dialog';
import { routes } from '@/lib/routes';

export const GuestMenu = () => {
  const [loginDialogOpen, setLoginDialogOpen] = useState<boolean>(false);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1.5 px-2 sm:px-4"
        onClick={() => setLoginDialogOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        <span className="hidden sm:inline">ログイン / 新規登録</span>
      </Button>

      <Dialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        title="ログイン"
      >
        <div className="flex flex-col gap-3">
          <LoginForm />
          <Link
            href={routes.auth.register()}
            onClick={() => setLoginDialogOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            新規登録
          </Link>
        </div>
      </Dialog>
    </div>
  );
};


