/**
 * Mini-program customer service 单测（P0 · 三端补测试）.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

vi.mock("@lieshoucloud/contract-api", () => ({ request: mockRequest }));

import { STATUS_META, countCustomers, getCustomer, listCustomers } from "./customer";

beforeEach(() => {
  mockRequest.mockReset();
});

describe("mini-program customer service", () => {
  it("listCustomers 无参数 → GET /customers（query 空对象）", async () => {
    mockRequest.mockResolvedValue([]);
    await listCustomers();
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/customers", query: {} });
  });

  it("listCustomers 带 keyword + status → query 对象", async () => {
    mockRequest.mockResolvedValue([]);
    await listCustomers("王", "CONVERTED");
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/customers",
      query: { keyword: "王", status: "CONVERTED" },
    });
  });

  it("countCustomers → GET /customers/count", async () => {
    mockRequest.mockResolvedValue(8);
    await expect(countCustomers()).resolves.toBe(8);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/customers/count" });
  });

  it("getCustomer 动态 id", async () => {
    mockRequest.mockResolvedValue({ id: 11 });
    await getCustomer(11);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/customers/11" });
  });

  it("STATUS_META 四状态齐全", () => {
    expect(Object.keys(STATUS_META)).toEqual(["NEW", "FOLLOWING", "CONVERTED", "LOST"]);
    expect(STATUS_META.FOLLOWING.text).toBe("跟进中");
  });
});
