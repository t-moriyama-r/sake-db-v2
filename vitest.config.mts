import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Windows では forks プールの worker 起動がタイムアウトすることがあるため threads を使う
    pool: 'threads',
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.mts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'sake-db'],
  },
});
