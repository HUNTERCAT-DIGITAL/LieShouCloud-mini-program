/**
 * 小程序业务小组件（Phase 9 · 多端真实化）.
 *
 * Taro 不能用 antd / React Native；用 @tarojs/components + 内联样式实现。
 * 颜色 / 状态枚举与 admin / mobile 对齐。
 */
import type { CSSProperties, ReactNode } from "react";
import { Text, View } from "@tarojs/components";

const tagBase: CSSProperties = {
  display: "inline-block",
  padding: "4rpx 12rpx",
  borderRadius: "4rpx",
  fontSize: "22rpx",
  color: "#fff",
  fontWeight: 600,
  lineHeight: 1.4,
};

/** 状态徽章 */
export function StatusBadge({ text, color }: { text: string; color: string }): ReactNode {
  return (
    <View style={{ ...tagBase, backgroundColor: color }}>
      <Text style={{ color: "#fff", fontSize: "22rpx" }}>{text}</Text>
    </View>
  );
}

/** 角色徽章 */
const ROLE_COLORS: Record<string, string> = {
  PLATFORM_ADMIN: "#faad14",
  TENANT_ADMIN: "#fa8c16",
  ADMIN: "#fa8c16",
  USER: "#1677ff",
};

export function RoleBadge({ role }: { role: string }): ReactNode {
  const color = ROLE_COLORS[role] ?? "#8c8c8c";
  return (
    <View style={{ ...tagBase, backgroundColor: color }}>
      <Text style={{ color: "#fff", fontSize: "22rpx" }}>{role}</Text>
    </View>
  );
}

/** 空态 */
export function EmptyState({ message = "暂无数据" }: { message?: string }): ReactNode {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: "64rpx 0",
      }}
    >
      <Text style={{ fontSize: "28rpx", color: "#999" }}>📭 {message}</Text>
    </View>
  );
}
