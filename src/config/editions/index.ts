/**
 * 版别解析（端自身骨架 · 类型来自共享契约 contract-types）：
 * 构建期 `TARO_APP_EDITION` 注入 → generic 兜底。客户页面级注入走 ./extra.ts。
 */
import type { EditionConfig } from '@lieshoucloud/contract-types';

import { genericEdition } from './generic';

export function resolveEditionId(): string {
  // typeof 守卫：浏览器运行时 process 未定义，短路返回 undefined（webpack5 不 polyfill process）
  const env = (typeof process !== 'undefined' && process.env?.TARO_APP_EDITION) || undefined;
  if (env?.trim()) return env.trim();
  return 'generic';
}

export function getEdition(): EditionConfig {
  const id = resolveEditionId();
  return id === 'generic' ? genericEdition : { ...genericEdition, id };
}
