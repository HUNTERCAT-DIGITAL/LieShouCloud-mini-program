/**
 * 全局小程序配置.
 * pages 数组顺序 = 启动时默认首页.
 * 客户仓注入：prepare 生成 src/config/editions/extra.ts
 * 提供 EXTRA_PAGES（客户专属页面路径），此处展开。
 */
import { EXTRA_PAGES } from "./config/editions/extra";

export default {
  pages: [
    "pages/login/login",
    "pages/workbench/workbench",
    "pages/customers/index",
    "pages/customers/detail",
    "pages/inventory/inventory",
    "pages/finance/finance",
    "pages/approval/approval",
    ...(EXTRA_PAGES ?? []),
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#1677ff",
    navigationBarTitleText: "LieShou Cloud",
    navigationBarTextStyle: "white",
    backgroundColor: "#f7f7f7",
  },
} as const;
