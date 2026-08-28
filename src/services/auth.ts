/**
 * 小程序 auth API service（Phase 9 · 多端真实化）.
 *
 * Taro 4 fetch：跨 weapp / h5 / swan / alipay 平台，底层走各平台原生网络。
 * 注意：小程序 fetch 域名必须在「微信公众平台 → 服务器域名」白名单
 * （开发期可在开发者工具勾「不校验合法域名」）。
 */
import { request } from "@lieshoucloud/contract-api";
import type { CurrentUser, LoginRequest, TokenResponse } from "@lieshoucloud/contract-types";

// 错误类型收敛（Bottom-Up · 2026-09）：ApiError / isApiError 来自契约层
// （@lieshoucloud/contract-api 已提供 code/status 透传），端侧不再重复定义。
export { isApiError } from "@lieshoucloud/contract-api";

export async function login(req: LoginRequest): Promise<TokenResponse> {
  return request<TokenResponse>({ method: "POST", path: `/auth/login`, body: req });
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  return request<CurrentUser>({ method: "GET", path: `/auth/me` });
}

