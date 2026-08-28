/**
 * 小程序 approval service —— 2026-09 下沉 core-web：审批 API 由
 * @lieshoucloud/core-web features/approval（approval.api.ts）提供（业务逻辑唯一源）。
 * 此处 re-export 保持 services/approval 为端侧统一出口（页面 import 路径不变）；
 * 类型/META 来自契约层（approval 模块无同名冲突，顶层可导）。
 * 注意：共享层 META 的 color 为 antd 语义色，由 MiniUI StatusBadge 经 ANTD_TAG_COLORS 映射。
 */
export type {
  ApprovalCounts,
  ApprovalRequest,
  ApprovalStatus,
  ApprovalType,
  CreateApprovalRequest,
} from "@lieshoucloud/contract-types";
export { APPROVAL_STATUS_META, APPROVAL_TYPE_META } from "@lieshoucloud/contract-types";
export {
  listApprovals,
  getApprovalCounts,
  createApproval,
  approveApproval,
  rejectApproval,
  cancelApproval,
} from "@lieshoucloud/core-web";
