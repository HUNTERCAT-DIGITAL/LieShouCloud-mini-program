/**
 * Mini-program customer service 单测（P0 · 三端补测试）.
 *
 * 2026-09 下沉 core-web 后：业务请求统一经 core-web 注入的 api 端口
 * （provider.requestApi，路径带 /api 前缀与契约一致），此处注入 mock 端口断言请求形态。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { configureCore } from "@lieshoucloud/core-web";

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

import { STATUS_META, countCustomers, getCustomer, listCustomers } from "./customer";

beforeEach(() => {
  mockRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: mockRequest },
  });
});

describe("mini-program customer service", () => {
  it("listCustomers 无参数 → GET /api/customers", async () => {
    mockRequest.mockResolvedValue([]);
    await listCustomers();
    expect(mockRequest).toHaveBeenCalledWith("/api/customers", undefined);
  });

  it("listCustomers 带 keyword + status → query 拼入 path", async () => {
    mockRequest.mockResolvedValue([]);
    await listCustomers("王", "CONVERTED");
    expect(mockRequest).toHaveBeenCalledWith(
      "/api/customers?keyword=%E7%8E%8B&status=CONVERTED",
      undefined,
    );
  });

  it("countCustomers → GET /api/customers/count", async () => {
    mockRequest.mockResolvedValue(8);
    await expect(countCustomers()).resolves.toBe(8);
    expect(mockRequest).toHaveBeenCalledWith("/api/customers/count", undefined);
  });

  it("getCustomer 动态 id", async () => {
    mockRequest.mockResolvedValue({ id: 11 });
    await getCustomer(11);
    expect(mockRequest).toHaveBeenCalledWith("/api/customers/11", undefined);
  });

  it("STATUS_META 四状态齐全", () => {
    expect(Object.keys(STATUS_META)).toEqual(["NEW", "FOLLOWING", "CONVERTED", "LOST"]);
    expect(STATUS_META.FOLLOWING.text).toBe("跟进中");
  });
});
