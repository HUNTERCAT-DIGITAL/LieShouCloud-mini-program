/**
 * 小程序 approval service（ADR-0032 · 审批流，多端接入）.
 *
 * 类型收敛（Bottom-Up · 2026-09）：ApprovalType / ApprovalStatus / ApprovalRequest /
 * ApprovalCounts / CreateApprovalRequest / APPROVAL_TYPE_META / APPROVAL_STATUS_META
 * 一律来自契约层（@lieshoucloud/contract-types，approval 模块无同名冲突，顶层可导）；
 * 此处 re-export 保持 services/approval 为端侧统一出口（页面 import 路径不变）。
 * 注意：共享层 META 的 color 为 antd 语义色，由 MiniUI StatusBadge 经 ANTD_TAG_COLORS 映射。
 */
import { request } from "@lieshoucloud/contract-api";
import type {
  ApprovalCounts,
  ApprovalRequest,
  ApprovalStatus,
  ApprovalType,
  CreateApprovalRequest,
} from "@lieshoucloud/contract-types";
import {
  APPROVAL_STATUS_META,
  APPROVAL_TYPE_META,
} from "@lieshoucloud/contract-types";

export type {
  ApprovalCounts,
  ApprovalRequest,
  ApprovalStatus,
  ApprovalType,
  CreateApprovalRequest,
} from "@lieshoucloud/contract-types";
export { APPROVAL_STATUS_META, APPROVAL_TYPE_META };

/** 租户内列表（role: mine=我发起的 / inbox=待我审批 / all=全部） */
export async function listApprovals(params?: {
  role?: "mine" | "inbox" | "all";
  status?: ApprovalStatus;
  type?: ApprovalType;
}): Promise<ApprovalRequest[]> {
  const query: Record<string, string | number | boolean> = {};
  if (params?.role) query.role = params.role;
  if (params?.status) query.status = params.status;
  if (params?.type) query.type = params.type;
  return request<ApprovalRequest[]>({ method: "GET", path: "/approvals", query });
}

/** 待办计数（inbox=待我审批 / mine=我发起待处理） */
export async function getApprovalCounts(): Promise<ApprovalCounts> {
  return request<ApprovalCounts>({ method: "GET", path: "/approvals/counts" });
}

/** 发起审批 */
export async function createApproval(body: CreateApprovalRequest): Promise<ApprovalRequest> {
  return request<ApprovalRequest>({ method: "POST", path: "/approvals", body });
}

/** 通过（仅审批人） */
export async function approveApproval(id: number): Promise<ApprovalRequest> {
  return request<ApprovalRequest>({ method: "POST", path: `/approvals/${id}/approve`, body: {} });
}

/** 驳回（仅审批人，comment 必填） */
export async function rejectApproval(id: number, comment: string): Promise<ApprovalRequest> {
  return request<ApprovalRequest>({ method: "POST", path: `/approvals/${id}/reject`, body: { comment } });
}

/** 撤销（仅发起人） */
export async function cancelApproval(id: number): Promise<ApprovalRequest> {
  return request<ApprovalRequest>({ method: "POST", path: `/approvals/${id}/cancel`, body: {} });
}

