/**
 * Taro 入口 - 所有小程序页面的根容器.
 *
 * useLaunch 是 Taro 提供的「小程序 onLaunch」hook 适配,
 * 全局只会执行一次.
 *
 * @see https://docs.taro.zone/docs/react-entry
 */
import type { PropsWithChildren } from "react";
import { useLaunch, getStorageSync, setStorageSync, removeStorageSync, navigateTo, redirectTo, showToast, request } from "@tarojs/taro";
import { configureCore, useAuthStore } from "@lieshoucloud/core-web";

import { MINI_API_BASE, configureApiBaseUrl } from "./services/api";

// —— 注入 core-web 端口（业务核心层 · 2026-09 铺开）——
configureCore({
  storage: {
    get: (k) => getStorageSync(k) as string | null,
    set: (k, v) => setStorageSync(k, v),
    remove: (k) => removeStorageSync(k),
  },
  notifier: {
    success: (m) => showToast({ title: m, icon: "success" }),
    error: (m) => showToast({ title: m, icon: "none" }),
  },
  navigation: {
    to: (p) => navigateTo({ url: p }),
    replace: (p) => redirectTo({ url: p }),
  },
  // HTTP 传输：小程序无标准 fetch，走 Taro.request 桥接（core-web 业务请求统一经此）
  api: {
    request: async (path, init) => {
      const method = (init?.method ?? "GET").toUpperCase() as
        | "GET"
        | "POST"
        | "PUT"
        | "DELETE"
        | "PATCH";
      const res = await request({
        url: `${MINI_API_BASE}${path}`,
        method,
        data:
          init?.body && typeof init?.body === "string"
            ? JSON.parse(init.body)
            : init?.body,
        header: (init?.headers ?? {}) as Record<string, string>,
      });
      if (res.statusCode >= 400) {
        const body = (res.data ?? {}) as { message?: string; error?: string };
        throw new Error(body.message || body.error || `请求失败 HTTP ${res.statusCode}`);
      }
      return res.data;
    },
  },
});

// core-web auth store 采用 skipHydration（端口注入后显式恢复会话，2026-09 正本清源）
void useAuthStore.persist.rehydrate();

// 入口模块加载时即配置 API 网关地址（TARO_APP_API_BASE 可覆盖，见 services/api.ts）
configureApiBaseUrl();

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    // eslint-disable-next-line no-console -- 启动日志（有意保留）
    console.log("[LieShou Cloud Mini] App launched.");
  });

  // children 是 Taro 自动注入的页面栈
  return children;
}

export default App;
