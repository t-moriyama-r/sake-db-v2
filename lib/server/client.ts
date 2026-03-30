import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const outputs = require('@/amplify_outputs.json');

// サーバーサイド向けに SSR モードで Amplify を設定
Amplify.configure(outputs, { ssr: true });

/**
 * ゲスト（未認証）読み取り可能なデータ用クライアント。
 * identityPool の匿名認証を使用するため Cookie 不要。
 * unstable_cache 内から安全に呼び出せる。
 */
export function getGuestClient() {
  return generateClient<Schema>({ authMode: 'identityPool' });
}
