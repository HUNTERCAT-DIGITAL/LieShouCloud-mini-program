/**
 * 全局小程序配置（端自身骨架）.
 * pages 数组顺序 = 启动时默认首页；客户启动页（EXTRA_HOME）优先。
 */
import { EXTRA_HOME, EXTRA_PAGES } from './config/editions/extra';
import { getEdition } from './config/editions';

const DEFAULT_ENTRY = 'pages/login/login';
const edition = getEdition();
const home = EXTRA_HOME ?? DEFAULT_ENTRY;

// 去重：启动页可能与 EXTRA_PAGES 重复
const allPages = [
  home,
  'pages/home/home',
  // 客户启动页存在时，登录页保持可路由（首页入口跳转）
  ...(home === DEFAULT_ENTRY ? [] : [DEFAULT_ENTRY]),
  ...(EXTRA_PAGES ?? []),
];
const pages = [...new Set(allPages)];

export default {
  pages,
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#02429b',
    navigationBarTitleText: edition.brandName,
    navigationBarTextStyle: 'white',
    backgroundColor: '#f7f7f7',
  },
} as const;
