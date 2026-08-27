import { setBaseUrl } from "@lieshoucloud/contract-api";
import type { HealthStatus } from "@lieshoucloud/contract-types";

/**
 * 小程序 API 网关地址解析（Phase 9 · 多端真实化 + 配置化）.
 *
 * 小程序 fetch 限制（必须 HTTPS + 域名白名单）：
 *  - 真机 / 开发者工具预览 → 必须在「微信公众平台 → 开发管理 → 服务器域名」
 *    把网关域名加入 request 合法域名；
 *  - 开发期可在开发者工具勾选「不校验合法域名」。
 *
 * 解析优先级：
 *   1. 构建期环境变量 `TARO_APP_API_BASE`（Taro 约定：`TARO_APP_*` 编译期注入）
 *      例：`TARO_APP_API_BASE=https://api.example.com pnpm dev:weapp`
 *   2. h5 开发（`TARO_ENV=h5`）→ 空串，走同源反代（vite / nginx /api → gateway）
 *   3. weapp 默认 → 现有公网 dev 栈域名（nginx `/api/*` → gateway，见
 *      deploy/bt-panel-nginx/dev.lieshoucloud.huntercat.cn.conf）
 */
import { readEnv } from "@lieshoucloud/contract-config";

const DEFAULT_API_BASE = "https://dev.lieshoucloud.huntercat.cn";

function resolveBaseUrl(): string {
  const fromEnv = readEnv("API_BASE", "taro");
  if (fromEnv) return fromEnv;
  // 注意：小程序端无 process 全局，必须防御式访问（Taro 编译期不保证替换）
  const isH5 =
    typeof process !== "undefined" && process.env?.TARO_ENV === "h5";
  return isH5 ? "" : DEFAULT_API_BASE;
}

/** 当前生效的 API 网关地址（模块加载时解析一次；导出便于测试 / 调试） */
export const MINI_API_BASE = resolveBaseUrl();

/** 启动时调用一次：让 @lieshoucloud/contract-api 的 request() 拼出绝对网关地址 */
export function configureApiBaseUrl(): void {
  setBaseUrl(MINI_API_BASE);
}

/**
 * 健康检查 - 直连 gateway /actuator/health（无 /api 前缀，无需鉴权）.
 * 失败返回 'down'，不影响 UI.
 */
export async function fetchGatewayHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${MINI_API_BASE}/actuator/health`);
    const data = (await res.json()) as { status: HealthStatus };
    return data.status;
  } catch {
    return "down";
  }
}

