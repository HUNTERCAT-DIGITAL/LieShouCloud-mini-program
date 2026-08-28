/**
 * 小程序 finance service —— 2026-09 下沉 core-web：记账 API 由
 * @lieshoucloud/core-web features/finance（finance.api.ts）提供（业务逻辑唯一源）。
 * 此处 re-export 保持 services/finance 为端侧统一出口（页面 import 路径不变）；
 * getSummary 对齐 core-web getLedgerSummary（重命名导出）。
 * 类型/META 来自契约层（finance 模块无同名冲突，顶层可导）。
 */
export type {
  CreateLedgerRequest,
  LedgerEntry,
  LedgerSummary,
  LedgerType,
} from "@lieshoucloud/contract-types";
export { LEDGER_CATEGORIES, LEDGER_TYPE_META } from "@lieshoucloud/contract-types";
export { listLedger, createLedger, getLedgerSummary as getSummary } from "@lieshoucloud/core-web";
