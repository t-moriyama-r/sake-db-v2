'use client';

import { Amplify } from 'aws-amplify';

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const outputs = require('@/amplify_outputs.json');
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
    'amplify_outputs.json が見つかりません。`npx ampx sandbox` を実行して生成してください。',
  );
}

export const AmplifyProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
