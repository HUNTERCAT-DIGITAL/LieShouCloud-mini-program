/**
 * 客户仓注入槽位（客户聚合仓模式 · 2026-09）.
 * 独立仓库：占位（空）；客户仓 deploy:prepare 会覆盖本文件注入：
 *  - EXTRA_HOME：客户启动页（优先于默认登录页，对外内容页/品牌首页）
 *  - EXTRA_PAGES：客户专属页面路径（app.config 展开注册）
 *  - EXTRA_TABBAR：客户底部导航（原生 tabBar，免登录内容页组）
 *  - EXTRA_ENTRIES：客户工作台快捷入口（workbench 渲染）
 * 注：Taro(webpack5) 不支持 import.meta.glob，故采用单一槽位文件；
 * 一个部署 = 一个客户，槽位文件名保持中性（extra），不绑定具体客户。
 */
export interface ClientEntry {
  /** 入口 key（唯一） */
  key: string;
  /** 入口文案（含 emoji 前缀，风格同 BASE_ENTRIES） */
  label: string;
  /** 页面路径（相对小程序根，如 /pages/huntercat/delivery/index） */
  url: string;
}

export const EXTRA_PAGES: string[] = [];

/** 客户启动页（对外品牌/内容首页，优先于默认登录页） */
export const EXTRA_HOME: string | undefined = undefined;

/** 客户底部导航（原生 tabBar；list 2-5 项，pagePath 须在 pages 中） */
export interface ClientTabBarItem {
  pagePath: string;
  text: string;
  iconPath?: string;
  selectedIconPath?: string;
}

export interface ClientTabBar {
  color: string;
  selectedColor: string;
  backgroundColor: string;
  list: ClientTabBarItem[];
}

export const EXTRA_TABBAR: ClientTabBar | undefined = undefined;

export const EXTRA_ENTRIES: ClientEntry[] = [];
