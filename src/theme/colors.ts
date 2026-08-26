/**
 * Mini Program 主题色 - 与 apps/admin / apps/mobile 对齐.
 * 小程序单位固定 rpx; 此处只导出颜色, 实际尺寸在各组件的 style 字符串中.
 */
export const colors = {
  primary: "#1677ff",
  bg: "#ffffff",
  text: "#1f1f1f",
  textSecondary: "#666666",
  border: "#e0e0e0",
  success: "#52c41a",
  error: "#f5222d",
  warning: "#faad14",
} as const;

export type ThemeColor = keyof typeof colors;
