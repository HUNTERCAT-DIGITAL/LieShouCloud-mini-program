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

/**
 * antd Tag 预设色 → 小程序色值（对齐 admin-web 的 antd 色彩体系）.
 * 共享层 META（STATUS_META / APPROVAL_*_META / MOVEMENT_META）的 color
 * 是 antd 语义色名（blue/gold/processing/volcano...），非 CSS 色值；
 * 端侧无 antd，StatusBadge 实心色块消费时经此映射。
 * 未命中（如直接传 hex）回退原值。
 */
const ANTD_TAG_COLORS: Record<string, string> = {
  magenta: "#eb2f96",
  red: "#f5222d",
  volcano: "#fa541c",
  orange: "#fa8c16",
  gold: "#faad14",
  lime: "#a0d911",
  green: "#52c41a",
  cyan: "#13c2c2",
  blue: "#1677ff",
  geekblue: "#2f54eb",
  purple: "#722ed1",
  // antd 状态色
  processing: "#1677ff",
  success: "#52c41a",
  error: "#ff4d4f",
  warning: "#faad14",
  // default 中性灰（StatusBadge 为实心白字风格）
  default: "#8c8c8c",
};

/** 状态徽章 */
export function StatusBadge({ text, color }: { text: string; color: string }): ReactNode {
  return (
    <View style={{ ...tagBase, backgroundColor: ANTD_TAG_COLORS[color] ?? color }}>
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
