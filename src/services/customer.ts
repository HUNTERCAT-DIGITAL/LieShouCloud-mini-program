/**
 * 小程序 customer service —— 2026-09 下沉 core-web：客户 API 由
 * @lieshoucloud/core-web features/crm（crm.api.ts）提供（业务逻辑唯一源）。
 * 此处 re-export 保持 services/customer 为端侧统一出口（页面 import 路径不变）；
 * 类型/META 仍来自契约层（STATUS_META 因 contract-types index `export *` 同名冲突走深路径）。
 */
export type { Customer, CustomerStatus } from "@lieshoucloud/contract-types";
export { STATUS_META } from "@lieshoucloud/contract-types/business/customer";
export { isApiError } from "@lieshoucloud/contract-api";
export { listCustomers, countCustomers, getCustomer } from "@lieshoucloud/core-web";
