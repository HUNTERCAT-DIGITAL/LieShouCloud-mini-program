/**
 * 小程序客户详情（Phase 9 · 多端真实化）.
 */
import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";

import { EmptyState, StatusBadge } from "../../components/MiniUI";
import { getCustomer, isCustomerApiError, STATUS_META, type Customer } from "../../services/customer";
import { colors } from "../../theme/colors";

export default function CustomerDetail() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Taro 在 h5 用 URLSearchParams；weapp 用 router.params；用 getCurrentInstance 统一拿
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pages = (Taro as any).getCurrentInstance?.()?.router?.params as
      | Record<string, string | undefined>
      | undefined;
    const raw = pages?.id;
    const cid = Number(raw);
    if (!Number.isFinite(cid)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    getCustomer(cid)
      .then(setCustomer)
      .catch((e: unknown) => {
        if (isCustomerApiError(e) && e.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ padding: "64rpx", textAlign: "center" }}>
        <Text style={{ color: colors.textSecondary }}>加载中...</Text>
      </View>
    );
  }

  if (notFound || !customer) {
    return (
      <View style={{ padding: "64rpx 32rpx" }}>
        <EmptyState message="客户不存在或不属于当前租户" />
        <View
          onClick={() => Taro.navigateBack()}
          style={{
            marginTop: "32rpx",
            textAlign: "center",
            color: colors.primary,
            fontSize: "28rpx",
          }}
        >
          <Text style={{ color: colors.primary }}>返回列表</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ minHeight: "100vh", padding: "32rpx", backgroundColor: colors.bg }}>
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: "12rpx",
          padding: "32rpx",
          marginBottom: "24rpx",
          border: "1rpx solid #eee",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24rpx",
            paddingBottom: "24rpx",
            borderBottom: "1rpx solid #f0f0f0",
          }}
        >
          <Text style={{ fontSize: "40rpx", fontWeight: 700, color: colors.text, flex: 1 }}>{customer.name}</Text>
          <StatusBadge {...STATUS_META[customer.status]} />
        </View>

        <Row label="客户名称">{customer.name}</Row>
        <Row label="状态">
          <StatusBadge {...STATUS_META[customer.status]} />
        </Row>
        <Row label="联系人">{customer.contactName ?? "—"}</Row>
        <Row label="联系电话">{customer.contactPhone ?? "—"}</Row>
        <Row label="邮箱">{customer.email ?? "—"}</Row>
        <Row label="创建时间">{customer.createdAt}</Row>
      </View>

      <View
        onClick={() => Taro.navigateBack()}
        style={{
          backgroundColor: "#fff",
          border: "1rpx solid #d9d9d9",
          borderRadius: "8rpx",
          padding: "24rpx",
          textAlign: "center",
        }}
      >
        <Text style={{ color: colors.text, fontSize: "28rpx" }}>返回列表</Text>
      </View>
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20rpx 0",
        borderBottom: "1rpx solid #fafafa",
      }}
    >
      <Text style={{ fontSize: "26rpx", color: colors.textSecondary, width: "160rpx" }}>{label}</Text>
      <View style={{ flex: 1, alignItems: "flex-end" }}>{children}</View>
    </View>
  );
}
