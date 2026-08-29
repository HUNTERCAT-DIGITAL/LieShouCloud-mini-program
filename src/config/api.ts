import { CUSTOM_API_BASE } from './editions/extra';

/**
 * API 网关地址解析（端自身 · 小程序限制：必须 HTTPS + 域名白名单）.
 *
 * 解析优先级：
 *   1. 构建期 `TARO_APP_API_BASE`（Taro 约定 `TARO_APP_*` 编译期注入）
 *      例：`TARO_APP_API_BASE=https://api.example.com pnpm dev:weapp`
 *   2. h5 开发（TARO_ENV=h5）→ 空串，走同源反代（/api → gateway）
 *   3. weapp → 客户注入 `CUSTOM_API_BASE`（客户仓 prepare 生成 · 不硬编码在端自身）
 *   4. 兜底 → 通用 dev 栈域名
 */
const DEFAULT_API_BASE = 'https://dev.lieshoucloud.huntercat.cn';

function resolveBaseUrl(): string {
  // 构建期注入：process.env.* 由 defineConstants 替换为字面量（浏览器运行时无 process）
  const fromEnv = process.env.TARO_APP_API_BASE || undefined;
  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/+$/, '');
  const isH5 = process.env.TARO_ENV === 'h5';
  if (isH5) return '';
  return CUSTOM_API_BASE ?? DEFAULT_API_BASE;
}

/** 当前生效的 API 网关地址（模块加载时解析一次） */
export const API_BASE = resolveBaseUrl();
