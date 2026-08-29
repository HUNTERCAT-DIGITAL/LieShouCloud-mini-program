/**
 * 版别解析（端自身骨架）：
 * 构建期 `TARO_APP_EDITION` 注入（如 TARO_APP_EDITION=legalmind pnpm dev:weapp）→ generic 兜底。
 * 客户差异的页面级注入走 ./extra.ts（EXTRA_HOME/EXTRA_PAGES）。
 */
import { genericEdition } from './generic';
import type { EditionConfig } from './types';

export function resolveEditionId(): string {
  const env = process.env.TARO_APP_EDITION as string | undefined;
  if (env?.trim()) return env.trim();
  return 'generic';
}

export function getEdition(): EditionConfig {
  const id = resolveEditionId();
  return id === 'generic' ? genericEdition : { ...genericEdition, id };
}
