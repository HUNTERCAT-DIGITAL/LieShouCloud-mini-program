/**
 * 小程序 customer service（Phase 9 · 多端真实化）.
 *
 * 类型收敛（Bottom-Up · 2026-09）：Customer / CustomerStatus / STATUS_META
 * 一律来自契约层（@lieshoucloud/contract-types），禁止端侧重定义；
 * STATUS_META 因 contract-types index.ts `export *` 同名冲突不导出，走深路径。
 * 此处 re-export 保持 services/customer 为端侧统一出口（页面 import 路径不变）。
 */
import { request } from "@lieshoucloud/contract-api";
import type { Customer, CustomerStatus } from "@lieshoucloud/contract-types";
import { STATUS_META } from "@lieshoucloud/contract-types/business/customer";

export type { Customer, CustomerStatus } from "@lieshoucloud/contract-types";
export { STATUS_META };

export async function listCustomers(keyword?: string, status?: CustomerStatus): Promise<Customer[]> {
  const query: Record<string, string> = {};
  if (keyword) query.keyword = keyword;
  if (status) query.status = status;
  return request<Customer[]>({ method: "GET", path: `/customers`, query });
}

export async function countCustomers(): Promise<number> {
  return request<number>({ method: "GET", path: `/customers/count` });
}

export async function getCustomer(id: number): Promise<Customer> {
  return request<Customer>({ method: "GET", path: `/customers/${id}` });
}

// 错误类型收敛（Bottom-Up · 2026-09）：ApiError / isApiError 来自契约层
// （@lieshoucloud/contract-api，含 code/status 透传），不再重复定义 CustomerApiError。
export { isApiError } from "@lieshoucloud/contract-api";

