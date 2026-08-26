/**
 * Mini-program auth store 单测（Phase 9 · 多端真实化）.
 *
 * Taro 用 setStorageSync 持久化；在 jsdom 环境下 stub 为内存。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "../stores/auth";

const memory = new Map<string, string>();

// Stub @tarojs/taro 的 storage API —— 真实小程序走原生接口，jsdom 用内存替身
vi.mock("@tarojs/taro", () => ({
  default: {
    getStorageSync: (k: string) => memory.get(k) ?? "",
    setStorageSync: (k: string, v: string) => {
      memory.set(k, v);
    },
    removeStorageSync: (k: string) => {
      memory.delete(k);
    },
  },
}));

beforeEach(() => {
  memory.clear();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
});

afterEach(() => {
  memory.clear();
});

describe("mini-program auth store", () => {
  it("初始 isAuthenticated=false", () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("logout 清空 token + user", () => {
    useAuthStore.setState({
      accessToken: "a",
      refreshToken: "r",
      user: { userId: 1, username: "u", roles: [] },
      isAuthenticated: true,
    });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("setItem / getItem 透过 stub 持久化", () => {
    memory.set("k", "v");
    expect(memory.get("k")).toBe("v");
    memory.delete("k");
    expect(memory.has("k")).toBe(false);
  });
});
