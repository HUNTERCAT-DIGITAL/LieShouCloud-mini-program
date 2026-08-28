/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// Taro 编译期全局（@tarojs/runtime 在 jsdom 测试环境需要这些自由变量；
// 生产由 Taro 编译注入，测试环境这里显式声明）
const taroEnv = {
  ENABLE_INNER_HTML: 'false',
  ENABLE_MUTATION_OBSERVER: 'false',
  ENABLE_SIZE_APIS: 'false',
  ENABLE_NODE_LIST: 'false',
  ENABLE_TEMPLATE_CONTENT: 'false',
  ENABLE_CLONE_NODE: 'false',
  ENABLE_CONTAINS: 'false',
};

export default defineConfig({
  define: taroEnv,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
  },
});
