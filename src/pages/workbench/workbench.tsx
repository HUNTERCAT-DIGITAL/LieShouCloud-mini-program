/**
 * 小程序工作台（Phase 9 · 多端真实化）.
 */
import { Button, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";

import { EmptyState, RoleBadge } from "../../components/MiniUI";
import { countCustomers, listCustomers, STATUS_META, type Customer } from "../../services/customer";
import { useAuthStore } from "../../stores/auth";
import { colors } from "../../theme/colors";
import { getEdition, isEntryHidden } from "../../config/editions";
import { EXTRA_ENTRIES } from "../../config/editions/extra";

/** 通用快捷入口（所有版别基础；客户层可用 hiddenMenus 裁剪） */
const BASE_ENTRIES = [
  { key: "customers", label: "👥 客户", url: "/pages/customers/index" },
  { key: "inventory", label: "📦 库存", url: "/pages/inventory/inventory" },
  { key: "finance", label: "💰 记账", url: "/pages/finance/finance" },
  { key: "approval", label: "📋 审批", url: "/pages/approval/approval" },
];

export default function Workbench() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [count, setCount] = useState<number | null>(null);
  const [recent, setRecent] = useState<Customer[]>([]);

  const load = async () => {
    try {
      const [c, list] = await Promise.all([countCustomers(), listCustomers()]);
      setCount(c);
      setRecent([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5));
    } catch {
      setCount(null);
      setRecent([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onLogout = () => {
    logout();
    Taro.reLaunch({ url: "/pages/login/login" });
  };

  return (
    <View
      style={{
        minHeight: "100vh",
        padding: "32rpx",
        backgroundColor: colors.bg,
      }}
    >
      {/* 欢迎条 */}
      <View style={{ marginBottom: "32rpx" }}>
        <Text style={{ fontSize: "44rpx", fontWeight: 700, color: colors.text }}>
          {user?.username ?? "用户"}，欢迎回来
        </Text>
        <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginTop: "12rpx" }}>
          {(user?.roles ?? []).map((r) => (
            <View key={r} style={{ marginRight: "12rpx", marginTop: "8rpx" }}>
              <RoleBadge role={r} />
            </View>
          ))}
        </View>
      </View>

      {/* 统计卡 */}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          marginBottom: "32rpx",
          gap: "24rpx",
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: "12rpx",
            padding: "32rpx",
            borderTop: "6rpx solid " + colors.primary,
            borderLeft: "1rpx solid #eee",
            borderRight: "1rpx solid #eee",
            borderBottom: "1rpx solid #eee",
          }}
        >
          <Text style={{ fontSize: "24rpx", color: colors.textSecondary, marginBottom: "12rpx" }}>本租户客户</Text>
          <Text style={{ fontSize: "48rpx", fontWeight: 700, color: colors.primary }}>{count ?? "—"}</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: "12rpx",
            padding: "32rpx",
            borderTop: "6rpx solid " + colors.success,
            borderLeft: "1rpx solid #eee",
            borderRight: "1rpx solid #eee",
            borderBottom: "1rpx solid #eee",
          }}
        >
          <Text style={{ fontSize: "24rpx", color: colors.textSecondary, marginBottom: "12rpx" }}>今日新增</Text>
          <Text style={{ fontSize: "48rpx", fontWeight: 700, color: colors.success }}>3</Text>
        </View>
      </View>

      {/* 最近客户 */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: "12rpx",
          padding: "24rpx",
          marginBottom: "32rpx",
          border: "1rpx solid #eee",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16rpx",
          }}
        >
          <Text style={{ fontSize: "30rpx", fontWeight: 600, color: colors.text }}>快捷入口</Text>
        </View>
        <View style={{ display: "flex", flexDirection: "row", gap: "16rpx", flexWrap: "wrap" }}>
          {(() => {
            const edition = getEdition();
            const visible = [
              ...BASE_ENTRIES.filter((e) => !isEntryHidden(edition, e.url)),
              // 客户专属入口（客户仓 extra.ts 槽位注入；独立仓库为空数组）
              ...EXTRA_ENTRIES.filter((e) => !isEntryHidden(edition, e.url)),
            ];
            return visible.map((e) => (
              <View key={e.key} style={quickLinkStyle} onClick={() => Taro.navigateTo({ url: e.url })}>
                <Text style={{ color: colors.primary }}>{e.label}</Text>
              </View>
            ));
          })()}
        </View>
      </View>

      {/* 最近客户 */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: "12rpx",
          padding: "24rpx",
          marginBottom: "32rpx",
          border: "1rpx solid #eee",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16rpx",
          }}
        >
          <Text style={{ fontSize: "30rpx", fontWeight: 600, color: colors.text }}>最近客户</Text>
          <Text
            style={{ fontSize: "26rpx", color: colors.primary }}
            onClick={() => Taro.navigateTo({ url: "/pages/customers/index" })}
          >
            查看全部 →
          </Text>
        </View>
        {recent.length === 0 ? (
          <EmptyState message="暂无客户数据" />
        ) : (
          recent.map((c) => (
            <View
              key={c.id}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20rpx 0",
                borderBottom: "1rpx solid #f5f5f5",
              }}
              onClick={() => Taro.navigateTo({ url: `/pages/customers/detail?id=${c.id}` })}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: "28rpx", fontWeight: 600, color: colors.text }}>{c.name}</Text>
                <Text style={{ fontSize: "22rpx", color: colors.textSecondary, marginTop: "4rpx" }}>
                  {STATUS_META[c.status].text} · {c.createdAt}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Button
        onClick={onLogout}
        style={{
          backgroundColor: "#fafafa",
          color: colors.textSecondary,
          borderRadius: "8rpx",
          fontSize: "28rpx",
        }}
      >
        退出登录
      </Button>
    </View>
  );
}

const quickLinkStyle = {
  flex: 1,
  backgroundColor: "#f7f7f7",
  borderRadius: "8rpx",
  padding: "24rpx 0",
  textAlign: "center",
  border: "1rpx solid #eee",
} as const;
