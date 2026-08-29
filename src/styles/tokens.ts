/**
 * 小程序端设计令牌（Design Tokens）—— 对齐 mobile-ui.md（mobile App）与 UI.md 规范.
 * 单位：rpx（设计稿 750，1rpx = 0.5px@375）。mobile tokens（px）→ 本表 ×2。
 * 铁律：页面/组件样式必须走 token，禁止硬编码魔法值（状态色/间距/字号/圆角）。
 */

/** 品牌主色（平台蓝 · 对齐 app.config 导航栏与 web/mobile 品牌色） */
export const brandColor = '#02429b';

/** 页面/卡片/边框 */
export const bgColor = '#f5f6f7';
export const cardColor = '#ffffff';
export const borderColor = '#f0f0f0';

/** 文本层级（mobile-ui.md §2.1） */
export const textColor = {
  main: '#1f1f1f',
  secondary: '#8c8c8c',
  assist: '#bfbfbf',
  inverse: '#ffffff',
} as const;

/** 状态色（mobile-info-flow §6 · 全局唯一编码，禁止版别覆盖） */
export const statusColor = {
  error: '#f5222d', // 紧急 CRITICAL · 严重告警 / 温度≥70
  warning: '#faad14', // 警告 WARN · 温度 60~70
  success: '#52c41a', // 正常 · 在线
  offline: '#bfbfbf', // 离线灰
} as const;

/** 状态元信息（文案 + 颜色，供 StatusBadge 等使用） */
export const STATUS_META = {
  error: { text: '紧急', color: statusColor.error },
  warning: { text: '警告', color: statusColor.warning },
  success: { text: '正常', color: statusColor.success },
  offline: { text: '离线', color: statusColor.offline },
} as const;
export type StatusKey = keyof typeof STATUS_META;

/** 间距（4 基准 · mobile tokens ×2） */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 16,
  md: 32,
  lg: 40,
  xl: 48,
  xxl: 64,
} as const;

/** 字号（mobile tokens ×2 · rpx） */
export const fontSize = {
  xs: 22,
  sm: 24,
  md: 28,
  lg: 32,
  xl: 40,
  xxl: 44,
} as const;

/** 圆角（mobile tokens ×2 · rpx） */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

/** 行高 / 加粗 */
export const lineHeight = 1.5715;
export const fontWeightStrong = '600';
