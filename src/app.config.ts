/**
 * 全局小程序配置.
 * pages 数组顺序 = 启动时默认首页.
 */
export default {
  pages: [
    "pages/login/login",
    "pages/workbench/workbench",
    "pages/customers/index",
    "pages/customers/detail",
    "pages/legal/index",
    "pages/legal/detail",
    "pages/inventory/inventory",
    "pages/finance/finance",
    "pages/approval/approval",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#1677ff",
    navigationBarTitleText: "LieShou Cloud",
    navigationBarTextStyle: "white",
    backgroundColor: "#f7f7f7",
  },
} as const;
