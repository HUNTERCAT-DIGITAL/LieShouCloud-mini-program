/**
 * 小程序 finance service（Phase 9 · 多端接入）.
 *
 * 类型收敛（Bottom-Up · 2026-09）：LedgerType / LedgerEntry / LedgerSummary /
 * CreateLedgerRequest / LEDGER_TYPE_META / LEDGER_CATEGORIES 一律来自契约层
 * （@lieshoucloud/contract-types，finance 模块无同名冲突，顶层可导）；
 * 此处 re-export 保持 services/finance 为端侧统一出口（页面 import 路径不变）。
 * 注意：共享层 META 的 color 为 antd 语义色，由 MiniUI StatusBadge 经 ANTD_TAG_COLORS 映射。
 */
import { request } from "@lieshoucloud/contract-api";
import type {
  CreateLedgerRequest,
  LedgerEntry,
  LedgerSummary,
} from "@lieshoucloud/contract-types";
import { LEDGER_CATEGORIES, LEDGER_TYPE_META } from "@lieshoucloud/contract-types";

export type {
  CreateLedgerRequest,
  LedgerEntry,
  LedgerSummary,
  LedgerType,
} from "@lieshoucloud/contract-types";
export { LEDGER_CATEGORIES, LEDGER_TYPE_META };

export async function listLedger(): Promise<LedgerEntry[]> {
  return request<LedgerEntry[]>({ method: "GET", path: `/ledger` });
}

export async function getSummary(): Promise<LedgerSummary> {
  return request<LedgerSummary>({ method: "GET", path: `/ledger/summary` });
}

export async function createLedger(body: CreateLedgerRequest): Promise<LedgerEntry> {
  return request<LedgerEntry>({ method: "POST", path: `/ledger`, body });
}
