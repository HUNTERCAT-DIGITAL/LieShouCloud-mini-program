/**
 * Mini-program approval service 单测（ADR-0032 · 多端接入）.
 *
 * 2026-09 下沉 core-web 后：业务请求统一经 core-web 注入的 api 端口
 * （provider.requestApi，路径带 /api 前缀与契约一致），此处注入 mock 端口断言请求形态。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { configureCore } from "@lieshoucloud/core-web";

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

import {
  APPROVAL_STATUS_META,
  APPROVAL_TYPE_META,
  approveApproval,
  cancelApproval,
  createApproval,
  getApprovalCounts,
  listApprovals,
  rejectApproval,
} from "./approval";

beforeEach(() => {
  mockRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: mockRequest },
  });
});

describe("mini-program approval service", () => {
  it("listApprovals 无参数 → GET /api/approvals", async () => {
    mockRequest.mockResolvedValue([]);
    await listApprovals();
    expect(mockRequest).toHaveBeenCalledWith("/api/approvals", undefined);
  });

  it("listApprovals 带 role/status/type → query 拼入 path", async () => {
    mockRequest.mockResolvedValue([]);
    await listApprovals({ role: "inbox", status: "PENDING", type: "EXPENSE" });
    expect(mockRequest).toHaveBeenCalledWith(
      "/api/approvals?role=inbox&status=PENDING&type=EXPENSE",
      undefined,
    );
  });

  it("getApprovalCounts → GET /api/approvals/counts", async () => {
    mockRequest.mockResolvedValue({ inbox: 3, mine: 1 });
    await expect(getApprovalCounts()).resolves.toEqual({ inbox: 3, mine: 1 });
    expect(mockRequest).toHaveBeenCalledWith("/api/approvals/counts", undefined);
  });

  it("createApproval body 透传", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await createApproval({ type: "PURCHASE", title: "采购原料", approverId: 10 });
    expect(mockRequest).toHaveBeenCalledWith("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "PURCHASE", title: "采购原料", approverId: 10 }),
    });
  });

  it("approveApproval → POST /api/approvals/{id}/approve（空 body）", async () => {
    mockRequest.mockResolvedValue({ id: 1, status: "APPROVED" });
    await approveApproval(1);
    expect(mockRequest).toHaveBeenCalledWith("/api/approvals/1/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
  });

  it("rejectApproval → POST /api/approvals/{id}/reject（comment 必填）", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await rejectApproval(1, "金额超预算");
    expect(mockRequest).toHaveBeenCalledWith("/api/approvals/1/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: "金额超预算" }),
    });
  });

  it("cancelApproval → POST /api/approvals/{id}/cancel", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await cancelApproval(1);
    expect(mockRequest).toHaveBeenCalledWith("/api/approvals/1/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
  });

  it("类型/状态元数据", () => {
    expect(APPROVAL_TYPE_META.EXPENSE.text).toBe("支出报销");
    expect(APPROVAL_STATUS_META.PENDING.text).toBe("待审批");
  });
});
