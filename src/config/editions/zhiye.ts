/**
 * 版别配置 · zhiye.
 * 客户层声明（industries: 启用的行业能力）+ 品牌 + 菜单裁剪。
 */
import type { MiniEdition } from './types';

export const zhiyeEdition: MiniEdition = {
  id: 'zhiye',
  brandName: '智野教育',
  industries: ['edu'],
  hiddenMenus: ['/pages/customers', '/pages/inventory', '/pages/finance', '/pages/approval'],
};
