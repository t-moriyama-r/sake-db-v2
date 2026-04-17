'use client';

import { useEffect } from 'react';

/**
 * テーマ初期化プロバイダー。
 * localStorage の設定を読み取り html.dark クラスを適用する。
 * ダークモード切り替えボタンは useTheme() フックを呼び出して実装する。
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', stored === 'dark');
  }, []);

  return <>{children}</>;
};

