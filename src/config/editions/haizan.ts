/**
 * 版别配置 · haizan（海赞集团投资管理门户）.
 * 纯门户版别：行业能力为空，业务入口裁剪，仅保留集团专属入口（EXTRA_PAGES 注入）。
 */
import type { MiniEdition } from './types';

export const haizanEdition: MiniEdition = {
  id: 'haizan',
  brandName: '海赞集团',
  industries: [],
  hiddenMenus: ['/pages/customers', '/pages/legal', '/pages/inventory', '/pages/finance', '/pages/approval', '/pages/edu', '/pages/iot', '/pages/workbench'],
};
