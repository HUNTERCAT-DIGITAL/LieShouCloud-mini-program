/**
 * Mini-program legal service 单测（ADR-0036/0045）.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

vi.mock("@lieshoucloud/api-client", () => ({ request: mockRequest }));

import { getCase, listCaseEvents, listCases } from "./legal";

beforeEach(() => {
  mockRequest.mockReset();
});

describe("mini legal service", () => {
  it("listCases 无参数 → GET /legal/cases 默认分页 page=1 size=20", async () => {
    mockRequest.mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });
    await listCases();
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/legal/cases",
      query: { page: "1", size: "20" },
    });
  });

  it("listCases 带过滤 → query 只含非空项", async () => {
    mockRequest.mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });
    await listCases({ keyword: "赵某", status: "IN_TRIAL" }, 2, 10);
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/legal/cases",
      query: { page: "2", size: "10", keyword: "赵某", status: "IN_TRIAL" },
    });
  });

  it("getCase / listCaseEvents → GET 对应 path", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await getCase(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/legal/cases/1" });

    mockRequest.mockResolvedValue([]);
    await listCaseEvents(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/legal/cases/1/events" });
  });
});
