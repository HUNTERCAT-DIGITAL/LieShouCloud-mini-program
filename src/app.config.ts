/**
 * 全局小程序配置.
 * pages 数组顺序 = 启动时默认首页.
 * 客户仓注入：prepare 生成 src/config/editions/extra.ts
 * 提供 EXTRA_PAGES（客户专属页面路径），此处展开。
 */
import { EXTRA_HOME, EXTRA_PAGES } from "./config/editions/extra";

/** 客户启动页优先（对外内容页/品牌首页）；否则默认登录页 */
const DEFAULT_ENTRY = "pages/login/login";
const home = EXTRA_HOME ?? DEFAULT_ENTRY;

// 去重：启动页可能与 EXTRA_PAGES 重复（客户首页既注册为启动页也列入页面清单）
const allPages = [
  home,
  "pages/workbench/workbench",
  "pages/customers/index",
  "pages/customers/detail",
  "pages/inventory/inventory",
  "pages/finance/finance",
  "pages/approval/approval",
  // 客户启动页存在时，登录页保持可路由（首页入口跳转）
  ...(home === DEFAULT_ENTRY ? [] : [DEFAULT_ENTRY]),
  ...(EXTRA_PAGES ?? []),
];
const pages = [...new Set(allPages)];

export default {
  pages,
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#1677ff",
    navigationBarTitleText: "LieShou Cloud",
    navigationBarTextStyle: "white",
    backgroundColor: "#f7f7f7",
  },
} as const;
