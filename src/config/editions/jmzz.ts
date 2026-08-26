/**
 * 版别配置 · jmzz.
 * 客户层声明（industries: 启用的行业能力）+ 品牌 + 菜单裁剪。
 */
import type { MiniEdition } from './types';

export const jmzzEdition: MiniEdition = {
  id: 'jmzz',
  brandName: '猎手云 · 制造版',
  industries: [],
  hiddenMenus: ['/pages/customers', '/pages/legal', '/pages/approval'],
};
