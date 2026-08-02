import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// グローバル注入（test.globals）を使わない構成では RTL の自動 cleanup が働かないため、
// テストごとの DOM 破棄をここで明示する
afterEach(() => {
  cleanup();
});
