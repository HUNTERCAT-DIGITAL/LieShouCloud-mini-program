/**
 * 小程序 · 登录态与 API 访问（端自身实现 · 零上游共享依赖）
 * 存储走 Taro Storage，HTTP 走 Taro.request（小程序无标准 fetch）。
 */
import Taro from '@tarojs/taro';

import { API_BASE } from '../config/api';

const TOKEN_KEY = 'lsc_mini_access_token';
const REFRESH_KEY = 'lsc_mini_refresh_token';
const USER_KEY = 'lsc_mini_user';

export function getToken(): string | null {
  return (Taro.getStorageSync(TOKEN_KEY) as string) || null;
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export interface SessionUser {
  username?: string;
  displayName?: string;
  tenantCode?: string;
  tenantName?: string;
}

export function getUser(): SessionUser | null {
  const raw = Taro.getStorageSync<SessionUser | null>(USER_KEY);
  return raw && typeof raw === 'object' ? raw : null;
}

/** 登录（POST /api/auth/login） */
export async function login(
  username: string,
  password: string,
  tenantCode?: string,
): Promise<SessionUser> {
  const res = await Taro.request({
    url: `${API_BASE}/api/auth/login`,
    method: 'POST',
    data: { username, password, tenantCode },
    header: { 'Content-Type': 'application/json' },
  });
  if (res.statusCode >= 400) {
    const body = (res.data ?? {}) as { message?: string };
    throw new Error(body.message ?? `登录失败（HTTP ${res.statusCode}）`);
  }
  const data = res.data as {
    accessToken: string;
    refreshToken?: string;
    username?: string;
    displayName?: string;
    tenantCode?: string;
    tenantName?: string;
  };
  Taro.setStorageSync(TOKEN_KEY, data.accessToken);
  if (data.refreshToken) Taro.setStorageSync(REFRESH_KEY, data.refreshToken);
  Taro.setStorageSync(USER_KEY, {
    username: data.username,
    displayName: data.displayName,
    tenantCode: data.tenantCode,
    tenantName: data.tenantName,
  });
  return data;
}

/** 当前用户（GET /api/auth/me · 同时验证 token 有效性/连通性） */
export async function fetchMe(): Promise<SessionUser> {
  const res = await Taro.request({
    url: `${API_BASE}/api/auth/me`,
    method: 'GET',
    header: { Authorization: `Bearer ${getToken() ?? ''}` },
  });
  if (res.statusCode === 401) {
    logout();
    throw new Error('登录已过期，请重新登录');
  }
  if (res.statusCode >= 400) {
    throw new Error(`获取当前用户失败（HTTP ${res.statusCode}）`);
  }
  const me = res.data as SessionUser;
  Taro.setStorageSync(USER_KEY, me);
  return me;
}

export function logout(): void {
  Taro.removeStorageSync(TOKEN_KEY);
  Taro.removeStorageSync(REFRESH_KEY);
  Taro.removeStorageSync(USER_KEY);
}
