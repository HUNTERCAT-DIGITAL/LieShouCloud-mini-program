/**
 * Mini-program 版别（Edition）配置层 · 客户层 ↔ 行业层解耦（2026-09）.
 *
 * - 识别：TARO_APP_EDITION 构建期注入（Taro 约定 TARO_APP_* 编译期注入）
 *   → 默认 generic；登录后 tenantEdition（后端权威）兜底品牌展示。
 * - 装配：行业入口显隐由 edition.industries 派生；hiddenMenus 做客户级裁剪。
 */
import type { IndustryId } from '@lieshoucloud/contract-types';

import { genericEdition } from './generic';
import { layerEdition } from './layer';
import type { MiniEdition, MiniEditionId } from './types';

export type { MiniEdition, MiniEditionId } from './types';

const EDITION_ENV_KEY = 'TARO_APP_EDITION';

export const EDITIONS: Record<MiniEditionId, MiniEdition> = {
  generic: genericEdition,
  layer: layerEdition,
};

/** 解析当前部署版别（TARO_APP_EDITION 注入 → generic） */
export function resolveEditionId(): MiniEditionId {
  const v = process.env[EDITION_ENV_KEY] as string | undefined;
  if (v && v in EDITIONS) return v as MiniEditionId;
  return 'generic';
}

/** 域名推断（h5 部署兜底）：haizan.* → haizan */
export function resolveEditionFromHostname(_host: string): MiniEditionId {
  return 'generic';
}

/** 当前部署版别配置 */
export function getEdition(): MiniEdition {
  return EDITIONS[resolveEditionId()];
}

/** 客户版别启用的行业能力（行业入口显隐的派生入口） */
export function getEditionIndustries(edition: MiniEdition): IndustryId[] {
  return edition.industries ?? [];
}

/**
 * 客户在某行业启用的能力清单（模块级组合 · 2026-09）。
 * - capabilities 已声明 → 精确匹配该行业子集；
 * - 未声明（null）→ 行业全量。
 */
export function getEnabledCapabilities(edition: MiniEdition, industry: IndustryId): string[] | null {
  const caps = edition.capabilities ?? [];
  if (caps.length === 0) return null;
  return caps.filter((c) => c.startsWith(`${industry}/`));
}

/** 某能力是否被客户启用（缺省行业全量时返回 true） */
export function isCapabilityEnabled(
  edition: MiniEdition,
  industry: IndustryId,
  capability: string,
): boolean {
  const caps = getEnabledCapabilities(edition, industry);
  return caps === null || caps.includes(capability);
}

/** 入口裁剪：path 是否被版别隐藏（hiddenMenus 前缀匹配） */
export function isEntryHidden(edition: MiniEdition, path: string): boolean {
  return (edition.hiddenMenus ?? []).some((h) => path === h || path.startsWith(`${h}/`));
}

/** 后端租户版别 → 端配置（未知回退 generic） */
export function editionFromTenant(tenantEdition?: string | null): MiniEdition {
  const id = (tenantEdition ?? '').toLowerCase();
  return id in EDITIONS ? EDITIONS[id as MiniEditionId] : EDITIONS.generic;
}
