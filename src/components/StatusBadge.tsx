/**
 * 状态徽章 —— 对齐 mobile-ui.md §4.3：状态色文字 + 浅底（8% 透明），不用实心高饱和.
 */
import { Text, View } from '@tarojs/components';
import { STATUS_META, fontSize, radius, spacing, type StatusKey } from '../styles/tokens';

export interface StatusBadgeProps {
  status: StatusKey;
  text?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, text, size = 'sm' }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const padH = size === 'sm' ? spacing.sm : spacing.md;
  const font = size === 'sm' ? fontSize.xs : fontSize.sm;
  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${spacing.xxs}px ${padH}px`,
        borderRadius: `${radius.sm}px`,
        backgroundColor: meta.bg, // 浅底（rgba，兼容微信 CSS；8 位 hex #rrggbbaa 有兼容性风险）
      }}
    >
      <Text style={{ fontSize: `${font}px`, lineHeight: 1.4, color: meta.color, fontWeight: 600 }}>
        {text ?? meta.text}
      </Text>
    </View>
  );
}
