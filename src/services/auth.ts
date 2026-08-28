/**
 * 小程序 auth API service —— 2026-09 下沉 core-web：登录/当前用户等业务封装由
 * @lieshoucloud/core-web features/auth（auth.api.ts + auth.store）提供
 * （业务逻辑唯一源；页面登录走 useAuthStore().login，与本文件签名无关）。
 * 端侧仅保留统一出口 re-export + 契约层错误类型。
 */
export { isApiError } from "@lieshoucloud/contract-api";
export { login, fetchCurrentUser } from "@lieshoucloud/core-web";
