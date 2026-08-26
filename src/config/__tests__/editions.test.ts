/**
 * 版别配置层单测（ADR-0035 · mini-program 开源版 generic/layer）.
 *
 * 注：客户版别（dwjk/haizan/hekeren/huntercat/jmzz/legalmind/linkesecurity/zhiye）
 * 已在开源化时剥离（2026-08），相关测试随客户仓。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MiniEdition } from '../editions';
import {
  EDITIONS,
  getEditionIndustries,
  getEnabledCapabilities,
  isCapabilityEnabled,
  isEntryHidden,
  resolveEditionId,
} from '../editions';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('版别配置表（开源版）', () => {
  it('generic/layer 都有品牌配置', () => {
    for (const id of ['generic', 'layer'] as const) {
      expect(EDITIONS[id].brandName).toBeTruthy();
    }
  });

  it('generic 不启用行业；layer 声明启用 legal', () => {
    expect(getEditionIndustries(EDITIONS.generic)).toEqual([]);
    expect(getEditionIndustries(EDITIONS.layer)).toContain('legal');
  });
});

describe('行业能力装配（industry 包机制 · 客户仓注入）', () => {
  it('layer 未声明 capabilities → 行业全量（不过滤）', () => {
    expect(getEnabledCapabilities(EDITIONS.layer, 'legal')).toBeNull();
    expect(isCapabilityEnabled(EDITIONS.layer, 'legal', 'legal/cases')).toBe(true);
  });

  it('自定义组合：capabilities 精确匹配', () => {
    const custom: MiniEdition = {
      ...EDITIONS.layer,
      industries: ['legal', 'iot'],
      capabilities: ['legal/cases', 'iot/devices'],
    };
    expect(getEnabledCapabilities(custom, 'legal')).toEqual(['legal/cases']);
    expect(isCapabilityEnabled(custom, 'legal', 'legal/cases')).toBe(true);
    expect(isCapabilityEnabled(custom, 'legal', 'legal/time')).toBe(false);
    expect(isCapabilityEnabled(custom, 'iot', 'iot/devices')).toBe(true);
  });
});

describe('resolveEditionId（版别识别）', () => {
  it('VITE_EDITION 注入优先（layer）', () => {
    vi.stubEnv('TARO_APP_EDITION', 'layer');
    expect(resolveEditionId()).toBe('layer');
  });

  it('未知 → generic 兜底', () => {
    vi.stubEnv('TARO_APP_EDITION', 'bogus');
    expect(resolveEditionId()).toBe('generic');
  });
});

describe('入口裁剪（hiddenMenus）', () => {
  it('layer（法律版）隐藏通用业务入口，保留案件入口', () => {
    const e = EDITIONS.layer;
    expect(isEntryHidden(e, '/pages/customers/index')).toBe(true);
    expect(isEntryHidden(e, '/pages/inventory/inventory')).toBe(true);
    expect(isEntryHidden(e, '/pages/legal/index')).toBe(false);
  });

  it('generic 版不裁剪', () => {
    expect(EDITIONS.generic.hiddenMenus).toEqual([]);
    expect(isEntryHidden(EDITIONS.generic, '/pages/customers/index')).toBe(false);
  });
});
