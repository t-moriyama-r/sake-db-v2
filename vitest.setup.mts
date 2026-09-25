import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// グローバル注入（test.globals）を使わないため、テストごとに React Testing Library の DOM を明示的に破棄する
afterEach(() => {
  cleanup();
});
