/**
 * 版别解析（端自身骨架 · 类型来自共享契约 contract-types）：
 * 构建期 `TARO_APP_EDITION` 注入 → generic 兜底。客户页面级注入走 ./extra.ts。
 */
import type { EditionConfig } from '@lieshoucloud/contract-types';

import { genericEdition } from './generic';

export function resolveEditionId(): string {
  // 构建期注入：process.env.TARO_APP_EDITION 由 defineConstants 替换（浏览器运行时无 process）
  const env = process.env.TARO_APP_EDITION || undefined;
  if (env?.trim()) return env.trim();
  return 'generic';
}

export function getEdition(): EditionConfig {
  const id = resolveEditionId();
  return id === 'generic' ? genericEdition : { ...genericEdition, id };
}
