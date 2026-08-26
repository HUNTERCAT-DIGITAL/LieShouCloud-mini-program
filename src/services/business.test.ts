/**
 * Mini-program finance + inventory service 单测（P0 · 三端补测试）.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

vi.mock("@lieshoucloud/api-client", () => ({ request: mockRequest }));

import { LEDGER_CATEGORIES, createLedger, getSummary, listLedger } from "./finance";
import { MOVEMENT_META, listProducts, stockIn, stockOut } from "./inventory";

beforeEach(() => {
  mockRequest.mockReset();
});

describe("mini-program finance service", () => {
  it("listLedger → GET /ledger", async () => {
    mockRequest.mockResolvedValue([]);
    await listLedger();
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/ledger" });
  });

  it("getSummary → GET /ledger/summary", async () => {
    mockRequest.mockResolvedValue({ income: 100, expense: 30, balance: 70, count: 2 });
    await expect(getSummary()).resolves.toMatchObject({ balance: 70 });
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/ledger/summary" });
  });

  it("createLedger → POST /ledger + body 透传", async () => {
    mockRequest.mockResolvedValue({ id: 4 });
    const body = { type: "INCOME" as const, amount: 300, category: "服务收入", occurredAt: "2026-08-01" };
    await createLedger(body);
    expect(mockRequest).toHaveBeenCalledWith({ method: "POST", path: "/ledger", body });
  });

  it("分类元数据", () => {
    expect(LEDGER_CATEGORIES).toContain("工资");
  });
});

describe("mini-program inventory service", () => {
  it("listProducts → GET /products", async () => {
    mockRequest.mockResolvedValue([]);
    await listProducts();
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/products" });
  });

  it("stockIn → POST /products/{id}/stock-in", async () => {
    mockRequest.mockResolvedValue({ id: 1, stockQuantity: 30 });
    await stockIn(1, 10, "采购入库");
    expect(mockRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/products/1/stock-in",
      body: { quantity: 10, remark: "采购入库" },
    });
  });

  it("stockOut → POST /products/{id}/stock-out", async () => {
    mockRequest.mockResolvedValue({ id: 1, stockQuantity: 25 });
    await stockOut(1, 5);
    expect(mockRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/products/1/stock-out",
      body: { quantity: 5, remark: undefined },
    });
  });

  it("MOVEMENT_META 文案", () => {
    expect(MOVEMENT_META.IN.text).toBe("入库");
    expect(MOVEMENT_META.OUT.text).toBe("出库");
  });
});
