/**
 * Mini-program 版别（Edition）类型 · 客户层（与行业层解耦，2026-09）.
 * 精简版：端侧只关心品牌 / 启用的行业能力 / 菜单裁剪。
 */
import type { IndustryId } from '@lieshoucloud/types';

export type MiniEditionId = 'generic' | 'layer' | 'zhiye' | 'jmzz' | 'legalmind' | 'dwjk' | 'haizan' | 'huntercat' | 'linkesecurity';

export interface MiniEdition {
  id: MiniEditionId;
  /** 品牌名（导航栏标题等） */
  brandName: string;
  /** 启用的行业能力（行业入口显隐由此派生） */
  industries: IndustryId[];
  /**
   * 启用的能力清单（模块级组合 · 2026-09，缺省 = industries 对应行业全量）。
   * 约定 CapabilityId = `${industry}/${module}`，如 'legal/cases'、'iot/devices'。
   */
  capabilities?: string[];
  /** 隐藏菜单路径前缀（客户级裁剪） */
  hiddenMenus?: string[];
}
