/**
 * 小程序 inventory service（Phase 9 · 多端接入）.
 *
 * 类型收敛（Bottom-Up · 2026-09）：Product / StockMovementType / MOVEMENT_META /
 * CreateProductRequest 一律来自契约层（@lieshoucloud/contract-types），禁止端侧重定义；
 * 此处 re-export 保持 services/inventory 为端侧统一出口（页面 import 路径不变）。
 */
import { request } from "@lieshoucloud/contract-api";
import type {
  CreateProductRequest,
  Product,
} from "@lieshoucloud/contract-types";
import { MOVEMENT_META } from "@lieshoucloud/contract-types";

export type { CreateProductRequest, Product, StockMovementType } from "@lieshoucloud/contract-types";
export { MOVEMENT_META };

export async function listProducts(): Promise<Product[]> {
  return request<Product[]>({ method: "GET", path: `/products` });
}

export async function createProduct(body: CreateProductRequest): Promise<Product> {
  return request<Product>({ method: "POST", path: `/products`, body });
}

export async function stockIn(id: number, quantity: number, remark?: string): Promise<Product> {
  return request<Product>({ method: "POST", path: `/products/${id}/stock-in`, body: { quantity, remark } });
}

export async function stockOut(id: number, quantity: number, remark?: string): Promise<Product> {
  return request<Product>({ method: "POST", path: `/products/${id}/stock-out`, body: { quantity, remark } });
}
