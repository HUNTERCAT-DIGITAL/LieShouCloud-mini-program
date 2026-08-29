/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// Vitest 配置（端自身骨架）
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
