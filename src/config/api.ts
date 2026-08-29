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
  // 构建期注入：process.env.* 由 defineConstants 替换为字面量（浏览器运行时无 process）
  // H5（TARO_ENV=h5）→ 空串，走同源反代（/api → gateway）
  const fromEnv = process.env.TARO_APP_API_BASE || undefined;
  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/+$/, '');
  const isH5 = process.env.TARO_ENV === 'h5';
  return isH5 ? '' : DEFAULT_API_BASE;
}

/** 当前生效的 API 网关地址（模块加载时解析一次） */
export const API_BASE = resolveBaseUrl();
