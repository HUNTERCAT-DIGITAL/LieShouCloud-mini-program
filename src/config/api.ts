/**
 * API 网关地址解析（端自身 · 小程序限制：必须 HTTPS + 域名白名单）.
 *
 * 解析优先级：
 *   1. 构建期 `TARO_APP_API_BASE`（Taro 约定 `TARO_APP_*` 编译期注入）
 *      例：`TARO_APP_API_BASE=https://api.example.com pnpm dev:weapp`
 *   2. h5 开发（TARO_ENV=h5）→ 空串，走同源反代（/api → gateway）
 *   3. weapp 默认 → 公网 dev 栈域名（nginx /api/* → gateway）
 */
const DEFAULT_API_BASE = 'https://dev.lieshoucloud.huntercat.cn';

function resolveBaseUrl(): string {
  // typeof 守卫：浏览器运行时 process 未定义，短路返回 undefined（避免 ReferenceError / false.trim 崩溃）
  const fromEnv =
    (typeof process !== 'undefined' && process.env?.TARO_APP_API_BASE) || undefined;
  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/+$/, '');
  const isH5 = typeof process !== 'undefined' && process.env?.TARO_ENV === 'h5';
  return isH5 ? '' : DEFAULT_API_BASE;
}

/** 当前生效的 API 网关地址（模块加载时解析一次） */
export const API_BASE = resolveBaseUrl();
