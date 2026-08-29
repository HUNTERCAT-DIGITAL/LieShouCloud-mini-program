/**
 * 健康横幅（L1 状态信号）—— 对齐 mobile-info-flow §4.1：第一眼回答「有没有问题」.
 * 正常绿 / 异常红 + N 项需关注。
 */
import { Text, View } from '@tarojs/components';
import { fontSize, radius, spacing, STATUS_META, textColor, type StatusKey } from '../styles/tokens';

export default function HealthBanner({
  status,
  title,
  subtitle,
}: {
  status: StatusKey;
  title: string;
  subtitle?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: `${spacing.md}px ${spacing.lg}px`,
        borderRadius: `${radius.lg}px`,
        backgroundColor: meta.bg, // rgba 浅底（微信 CSS 兼容）
        borderLeft: `4px solid ${meta.color}`,
      }}
    >
      <Text style={{ fontSize: `${fontSize.lg}px`, fontWeight: 700, color: textColor.main, lineHeight: 1.4 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ marginTop: `${spacing.xs}px`, fontSize: `${fontSize.sm}px`, color: textColor.secondary }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
