/**
 * Mini-program 版别（Edition）装配逻辑单测 · 客户层与行业层解耦（2026-09）.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  EDITIONS,
  editionFromTenant,
  getEditionIndustries,
  isEntryHidden,
  resolveEditionId,
} from '../editions';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('版别配置表', () => {
  it('legalmind（凌科数安客户）声明启用 legal 行业能力', () => {
    expect(getEditionIndustries(EDITIONS.legalmind)).toContain('legal');
    expect(getEditionIndustries(EDITIONS.legalmind)).not.toContain('edu');
  });

  it('dwjk 声明启用 iot；zhiye 声明启用 edu；generic 不启用任何行业', () => {
    expect(getEditionIndustries(EDITIONS.dwjk)).toContain('iot');
    expect(getEditionIndustries(EDITIONS.zhiye)).toContain('edu');
    expect(getEditionIndustries(EDITIONS.generic)).toEqual([]);
  });
});

describe('入口裁剪（hiddenMenus 前缀匹配）', () => {
  it('legalmind 裁剪 CRM/库存/财务/审批入口，保留案件', () => {
    const e = EDITIONS.legalmind;
    expect(isEntryHidden(e, '/pages/customers/index')).toBe(true);
    expect(isEntryHidden(e, '/pages/inventory/inventory')).toBe(true);
    expect(isEntryHidden(e, '/pages/legal/index')).toBe(false);
  });

  it('generic 不裁剪基础入口', () => {
    expect(isEntryHidden(EDITIONS.generic, '/pages/customers/index')).toBe(false);
  });
});

describe('版别识别', () => {
  it('TARO_APP_EDITION 注入优先', () => {
    vi.stubEnv('TARO_APP_EDITION', 'legalmind');
    expect(resolveEditionId()).toBe('legalmind');
  });

  it('未注入回退 generic', () => {
    vi.unstubAllEnvs();
    expect(resolveEditionId()).toBe('generic');
  });

  it('tenantEdition 兜底转换（未知回退 generic）', () => {
    expect(editionFromTenant('DWJK').id).toBe('dwjk');
    expect(editionFromTenant('whatever').id).toBe('generic');
  });
});
