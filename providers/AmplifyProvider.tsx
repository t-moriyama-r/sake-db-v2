'use client';

import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

try {
  Amplify.configure(outputs, { ssr: true });

  if (typeof window !== 'undefined' && outputs?.auth?.user_pool_client_id) {
    const currentClientId: string = outputs.auth.user_pool_client_id;
    const prefix = 'CognitoIdentityServiceProvider.';
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && !key.startsWith(`${prefix}${currentClientId}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((k) => localStorage.removeItem(k));
  }
} catch {
  console.warn(
    'Amplify の初期化に失敗しました。amplify_outputs.json の内容を確認してください（`npx ampx sandbox` で再生成）。',
  );
}

export const AmplifyProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
