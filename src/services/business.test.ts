/**
 * Mini-program finance + inventory service 单测（P0 · 三端补测试）.
 *
 * 2026-09 下沉 core-web 后：业务请求统一经 core-web 注入的 api 端口
 * （provider.requestApi，路径带 /api 前缀与契约一致），此处注入 mock 端口断言请求形态。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { configureCore } from "@lieshoucloud/core-web";

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

import { LEDGER_CATEGORIES, createLedger, getSummary, listLedger } from "./finance";
import { MOVEMENT_META, listProducts, stockIn, stockOut } from "./inventory";

beforeEach(() => {
  mockRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: mockRequest },
  });
});

describe("mini-program finance service", () => {
  it("listLedger → GET /api/ledger", async () => {
    mockRequest.mockResolvedValue([]);
    await listLedger();
    expect(mockRequest).toHaveBeenCalledWith("/api/ledger", undefined);
  });

  it("getSummary → GET /api/ledger/summary", async () => {
    mockRequest.mockResolvedValue({ income: 100, expense: 30, balance: 70, count: 2 });
    await expect(getSummary()).resolves.toMatchObject({ balance: 70 });
    expect(mockRequest).toHaveBeenCalledWith("/api/ledger/summary", undefined);
  });

  it("createLedger → POST /api/ledger + body 透传", async () => {
    mockRequest.mockResolvedValue({ id: 4 });
    const body = { type: "INCOME" as const, amount: 300, category: "服务收入", occurredAt: "2026-08-01" };
    await createLedger(body);
    expect(mockRequest).toHaveBeenCalledWith("/api/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  });

  it("分类元数据", () => {
    expect(LEDGER_CATEGORIES).toContain("工资");
  });
});

describe("mini-program inventory service", () => {
  it("listProducts → GET /api/products", async () => {
    mockRequest.mockResolvedValue([]);
    await listProducts();
    expect(mockRequest).toHaveBeenCalledWith("/api/products", undefined);
  });

  it("stockIn → POST /api/products/{id}/stock-in", async () => {
    mockRequest.mockResolvedValue({ id: 1, stockQuantity: 30 });
    await stockIn(1, 10, "采购入库");
    expect(mockRequest).toHaveBeenCalledWith("/api/products/1/stock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 10, remark: "采购入库" }),
    });
  });

  it("stockOut → POST /api/products/{id}/stock-out", async () => {
    mockRequest.mockResolvedValue({ id: 1, stockQuantity: 25 });
    await stockOut(1, 5);
    expect(mockRequest).toHaveBeenCalledWith("/api/products/1/stock-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 5, remark: undefined }),
    });
  });

  it("MOVEMENT_META 文案", () => {
    expect(MOVEMENT_META.IN.text).toBe("入库");
    expect(MOVEMENT_META.OUT.text).toBe("出库");
  });
});
