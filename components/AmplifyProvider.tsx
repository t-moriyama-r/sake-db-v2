'use client';

import { Amplify } from 'aws-amplify';
import { useEffect } from 'react';

/**
 * Amplify の設定を行うクライアントコンポーネント。
 * amplify_outputs.json は `npx ampx sandbox` または CI/CD デプロイ後に生成される。
 * 生成前はダミー設定でスキップする。
 */
export const AmplifyProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const outputs = require('@/amplify_outputs.json');
      Amplify.configure(outputs, { ssr: true });
    } catch {
      // amplify_outputs.json が未生成（sandbox 前）の場合はスキップ
      console.warn('amplify_outputs.json not found. Run `npx ampx sandbox` to generate it.');
    }
  }, []);

  return <>{children}</>;
}
