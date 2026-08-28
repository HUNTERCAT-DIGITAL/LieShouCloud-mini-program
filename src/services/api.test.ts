/**
 * Mini-program api 配置 + 健康检查单测（Phase 9 · 配置化补测）.
 *
 * 注意：
 *  - 本文件 **mock @tarojs/taro** —— api.ts 的 fetchGatewayHealth 走 Taro.request
 *    桥接（非全局 fetch）；真实加载 Taro runtime 会在 jsdom 下缺 webpack
 *    DefinePlugin 注入的 ENABLE_INNER_HTML 等全局变量而 ReferenceError。
 *  - **不** mock @lieshoucloud/contract-api —— api.ts 需要真实 setBaseUrl
 *    验证 configureApiBaseUrl 装配（与 customer/business 测试的 mock 策略相反）。
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const DEFAULT_API_BASE = "https://dev.lieshoucloud.huntercat.cn";

const { mockTaroRequest } = vi.hoisted(() => ({ mockTaroRequest: vi.fn() }));

vi.mock("@tarojs/taro", () => ({ request: mockTaroRequest }));

/** 清空环境变量 + 重置模块缓存，让 api.ts 按当前 env 重新解析一次 */
async function loadApi() {
  vi.resetModules();
  return import("./api");
}

afterEach(() => {
  delete process.env.TARO_APP_API_BASE;
  delete process.env.TARO_ENV;
  mockTaroRequest.mockReset();
});

describe("mini-program api base 解析", () => {
  it("weapp 默认（无 env）→ 公网 dev 栈域名", async () => {
    const { MINI_API_BASE } = await loadApi();
    expect(MINI_API_BASE).toBe(DEFAULT_API_BASE);
  });

  it("TARO_APP_API_BASE 覆盖默认网关", async () => {
    process.env.TARO_APP_API_BASE = "https://api.prod.example.com";
    const { MINI_API_BASE } = await loadApi();
    expect(MINI_API_BASE).toBe("https://api.prod.example.com");
  });

  it("h5 开发（TARO_ENV=h5）→ 空串（同源反代）", async () => {
    process.env.TARO_ENV = "h5";
    const { MINI_API_BASE } = await loadApi();
    expect(MINI_API_BASE).toBe("");
  });

  it("configureApiBaseUrl 同步 setBaseUrl（不抛错）", async () => {
    const { configureApiBaseUrl, MINI_API_BASE } = await loadApi();
    expect(() => configureApiBaseUrl()).not.toThrow();
    expect(MINI_API_BASE).toBeTruthy();
  });
});

describe("mini-program fetchGatewayHealth", () => {
  it("成功 → 返回 status 且走 Taro.request（URL 为 MINI_API_BASE + /actuator/health）", async () => {
    mockTaroRequest.mockResolvedValue({ data: { status: "UP" } });

    const { fetchGatewayHealth, MINI_API_BASE } = await loadApi();
    await expect(fetchGatewayHealth()).resolves.toBe("UP");
    expect(mockTaroRequest).toHaveBeenCalledWith({
      url: `${MINI_API_BASE}/actuator/health`,
    });
  });

  it("网络失败 → down（不影响 UI）", async () => {
    mockTaroRequest.mockRejectedValue(new Error("network"));

    const { fetchGatewayHealth } = await loadApi();
    await expect(fetchGatewayHealth()).resolves.toBe("down");
  });
});
