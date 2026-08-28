/**
 * 小程序 inventory service —— 2026-09 下沉 core-web：进销存 API 由
 * @lieshoucloud/core-web features/inventory（inventory.api.ts + inventory.ts 业务规则）
 * 提供（业务逻辑唯一源）。
 * 此处 re-export 保持 services/inventory 为端侧统一出口（页面 import 路径不变）；
 * stockIn/stockOut 为端侧薄适配：core-web 走 StockChangeRequest 对象，
 * 端侧保持 (id, quantity, remark) 便捷签名（页面调用不变）。
 * 类型/META 来自契约层。
 */
import type { Product } from "@lieshoucloud/contract-types";
import {
  stockIn as coreStockIn,
  stockOut as coreStockOut,
} from "@lieshoucloud/core-web";

export type { CreateProductRequest, Product, StockMovementType } from "@lieshoucloud/contract-types";
export { MOVEMENT_META } from "@lieshoucloud/contract-types";
export { listProducts, createProduct } from "@lieshoucloud/core-web";

/** 入库（端侧便捷签名 → core-web StockChangeRequest） */
export function stockIn(id: number, quantity: number, remark?: string): Promise<Product> {
  return coreStockIn(id, { quantity, remark });
}

/** 出库（端侧便捷签名 → core-web StockChangeRequest） */
export function stockOut(id: number, quantity: number, remark?: string): Promise<Product> {
  return coreStockOut(id, { quantity, remark });
}
