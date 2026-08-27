/**
 * 小程序 auth store（Phase 9 · 多端真实化）.
 *
 * Taro 4 跨平台持久化：用 @tarojs/taro 的 Taro.setStorageSync / getStorageSync，
 * weapp / h5 / 各家小程序均可用。模块加载时注册 token provider → request 自动带。
 */
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import Taro from "@tarojs/taro";

import { setAccessTokenProvider } from "@lieshoucloud/contract-api";
import type { CurrentUser } from "@lieshoucloud/contract-types";
import { fetchCurrentUser, login as loginApi } from "../services/auth";

const STORAGE_KEY = "lieshoucloud:mini-auth";

// Taro 持久化适配（同步 API）：所有平台（含 h5 + weapp）都跑同一份代码
const taroStorage: StateStorage = {
  getItem: (k) => {
    try {
      return Taro.getStorageSync(k) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      Taro.setStorageSync(k, v);
    } catch {
      /* ignore */
    }
  },
  removeItem: (k) => {
    try {
      Taro.removeStorageSync(k);
    } catch {
      /* ignore */
    }
  },
};

// 模块加载时注册 token provider
setAccessTokenProvider(() => useAuthStore.getState().accessToken);

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;

  login: (username: string, password: string, tenantCode?: string) => Promise<void>;
  fetchMe: () => Promise<CurrentUser>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      login: async (username, password, tenantCode) => {
        const token = await loginApi({ username, password, tenantCode });
        set({
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          user: { userId: token.userId, username: token.username, roles: ["USER"] },
          isAuthenticated: true,
        });
        get()
          .fetchMe()
          .catch(() => undefined);
      },

      fetchMe: async () => {
        const me = await fetchCurrentUser();
        set({ user: me });
        return me;
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => taroStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
