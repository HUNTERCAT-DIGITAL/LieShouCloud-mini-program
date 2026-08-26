/**
 * 小程序库存管理页（Phase 9 · 多端接入）.
 * 商品列表 + 入库/出库 + 新建商品。
 */
import { Button, Input, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";

import { EmptyState, StatusBadge } from "../../components/MiniUI";
import { createProduct, listProducts, MOVEMENT_META, stockIn, stockOut, type Product } from "../../services/inventory";
import { colors } from "../../theme/colors";

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockType, setStockType] = useState<"IN" | "OUT">("IN");
  const [qty, setQty] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const load = async () => {
    try {
      setProducts(await listProducts());
    } catch {
      setProducts([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submitStock = async () => {
    if (!stockProduct || !qty) return;
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return;
    try {
      if (stockType === "IN") await stockIn(stockProduct.id, n);
      else await stockOut(stockProduct.id, n);
      Taro.showToast({ title: "成功", icon: "success" });
      setStockProduct(null);
      setQty("");
      void load();
    } catch (e) {
      Taro.showToast({ title: String(e), icon: "none" });
    }
  };

  const submitCreate = async () => {
    if (!name) return;
    try {
      await createProduct({ name, price: price ? Number(price) : undefined });
      Taro.showToast({ title: "已创建", icon: "success" });
      setCreateOpen(false);
      setName("");
      setPrice("");
      void load();
    } catch (e) {
      Taro.showToast({ title: String(e), icon: "none" });
    }
  };

  return (
    <View style={{ minHeight: "100vh", padding: "24rpx", backgroundColor: colors.bg }}>
      <Button
        onClick={() => setCreateOpen(true)}
        style={{ backgroundColor: colors.primary, color: "#fff", borderRadius: "8rpx", marginBottom: "24rpx" }}
      >
        新建商品
      </Button>

      {products.length === 0 ? (
        <EmptyState message="暂无商品" />
      ) : (
        products.map((p) => (
          <View
            key={p.id}
            style={{
              backgroundColor: "#fff",
              padding: "24rpx",
              borderRadius: "12rpx",
              marginBottom: "16rpx",
              border: "1rpx solid #eee",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8rpx",
              }}
            >
              <Text style={{ fontSize: "32rpx", fontWeight: 600, color: colors.text, flex: 1 }}>{p.name}</Text>
              <StatusBadge
                text={p.stockQuantity > 0 ? `库存 ${p.stockQuantity}` : "缺货"}
                color={p.stockQuantity > 0 ? colors.primary : "#f5222d"}
              />
            </View>
            <Text style={{ fontSize: "24rpx", color: colors.textSecondary }}>
              {p.code ?? "无编码"} · ¥ {p.price != null ? Number(p.price).toFixed(2) : "—"}
            </Text>
            <View style={{ display: "flex", flexDirection: "row", gap: "16rpx", marginTop: "16rpx" }}>
              <Button
                size="mini"
                onClick={() => {
                  setStockProduct(p);
                  setStockType("IN");
                }}
                style={{
                  color: MOVEMENT_META.IN.color,
                  border: "1rpx solid " + MOVEMENT_META.IN.color,
                  background: "#fff",
                }}
              >
                {MOVEMENT_META.IN.text}
              </Button>
              <Button
                size="mini"
                disabled={p.stockQuantity <= 0}
                onClick={() => {
                  setStockProduct(p);
                  setStockType("OUT");
                }}
                style={{
                  color: MOVEMENT_META.OUT.color,
                  border: "1rpx solid " + MOVEMENT_META.OUT.color,
                  background: "#fff",
                }}
              >
                {MOVEMENT_META.OUT.text}
              </Button>
            </View>
          </View>
        ))
      )}

      {/* 出入库 Modal（Taro 用原生 confirm 对话框代替） */}
      {stockProduct && (
        <View style={modalStyle}>
          <View style={{ backgroundColor: "#fff", borderRadius: "12rpx", padding: "32rpx" }}>
            <Text style={{ fontSize: "32rpx", fontWeight: 700, marginBottom: "16rpx" }}>
              {stockType === "IN" ? "入库" : "出库"}：{stockProduct.name}
            </Text>
            <Text style={{ fontSize: "24rpx", color: colors.textSecondary, marginBottom: "16rpx" }}>
              当前库存：{stockProduct.stockQuantity}
              {stockType === "OUT" && "（不能超过当前库存）"}
            </Text>
            <Input
              value={qty}
              onInput={(e) => setQty(e.detail.value)}
              type="number"
              placeholder="数量"
              placeholderStyle={`color: ${colors.textSecondary};`}
              style={{
                border: "1rpx solid #d9d9d9",
                borderRadius: "8rpx",
                padding: "16rpx",
                fontSize: "30rpx",
                marginBottom: "24rpx",
              }}
            />
            <Button onClick={() => void submitStock()} style={{ backgroundColor: colors.primary, color: "#fff" }}>
              确认{stockType === "IN" ? "入库" : "出库"}
            </Button>
            <Button
              onClick={() => setStockProduct(null)}
              style={{ background: "#fafafa", color: colors.textSecondary, marginTop: "16rpx" }}
            >
              取消
            </Button>
          </View>
        </View>
      )}

      {/* 新建商品 Modal */}
      {createOpen && (
        <View style={modalStyle}>
          <View style={{ backgroundColor: "#fff", borderRadius: "12rpx", padding: "32rpx" }}>
            <Text style={{ fontSize: "32rpx", fontWeight: 700, marginBottom: "16rpx" }}>新建商品</Text>
            <Input
              value={name}
              onInput={(e) => setName(e.detail.value)}
              placeholder="商品名称"
              placeholderStyle={`color: ${colors.textSecondary};`}
              style={inputStyle}
            />
            <Input
              value={price}
              onInput={(e) => setPrice(e.detail.value)}
              type="digit"
              placeholder="单价（元）"
              placeholderStyle={`color: ${colors.textSecondary};`}
              style={inputStyle}
            />
            <Button onClick={() => void submitCreate()} style={{ backgroundColor: colors.primary, color: "#fff" }}>
              创建
            </Button>
            <Button
              onClick={() => setCreateOpen(false)}
              style={{ background: "#fafafa", color: colors.textSecondary, marginTop: "16rpx" }}
            >
              取消
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "48rpx",
  zIndex: 100,
} as const;

const inputStyle = {
  border: "1rpx solid #d9d9d9",
  borderRadius: "8rpx",
  padding: "16rpx",
  fontSize: "30rpx",
  marginBottom: "24rpx",
} as const;
