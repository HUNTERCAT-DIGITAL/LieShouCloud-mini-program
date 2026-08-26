/**
 * 版别配置 · layer.
 * 客户层声明（industries: 启用的行业能力）+ 品牌 + 菜单裁剪。
 */
import type { MiniEdition } from './types';

export const layerEdition: MiniEdition = {
  id: 'layer',
  brandName: '猎手云 · 法律版',
  industries: ['legal'],
  hiddenMenus: ['/pages/customers', '/pages/inventory', '/pages/finance', '/pages/approval'],
};
