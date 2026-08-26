/**
 * Taro 入口 - 所有小程序页面的根容器.
 *
 * useLaunch 是 Taro 提供的「小程序 onLaunch」hook 适配,
 * 全局只会执行一次.
 *
 * @see https://docs.taro.zone/docs/react-entry
 */
import type { PropsWithChildren } from "react";
import { useLaunch } from "@tarojs/taro";

import { configureApiBaseUrl } from "./services/api";

// 入口模块加载时即配置 API 网关地址（TARO_APP_API_BASE 可覆盖，见 services/api.ts）
configureApiBaseUrl();

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log("[LieShou Cloud Mini] App launched.");
  });

  // children 是 Taro 自动注入的页面栈
  return children;
}

export default App;
