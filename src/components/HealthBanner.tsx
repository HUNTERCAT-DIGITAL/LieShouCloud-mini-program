/**
 * 健康横幅（L1 状态信号）—— 对齐 mobile-info-flow §4.1：第一眼回答「有没有问题」.
 * 状态圆形图标 + 状态色左条 + 浅底；正常绿 / 异常红。
 */
import { Text, View } from '@tarojs/components';
import { fontSize, radius, spacing, STATUS_META, textColor, type StatusKey } from '../styles/tokens';

const STATUS_ICON: Record<StatusKey, string> = {
  success: '✓',
  error: '!',
  warning: '!',
  offline: '·',
};

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
        flexDirection: 'row',
        alignItems: 'center',
        padding: `${spacing.md}px ${spacing.lg}px`,
        borderRadius: `${radius.lg}px`,
        backgroundColor: meta.bg,
        borderLeft: `6px solid ${meta.color}`,
      }}
    >
      <View
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '22px',
          backgroundColor: meta.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: `${spacing.md}px`,
          flexShrink: 0,
        }}
      >
        <Text style={{ color: '#fff', fontSize: `${fontSize.xl}px`, fontWeight: 700, lineHeight: 1 }}>
          {STATUS_ICON[status]}
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{ display: 'block', fontSize: `${fontSize.lg}px`, fontWeight: 700, color: textColor.main, lineHeight: 1.4 }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{ display: 'block', marginTop: `${spacing.xxs}px`, fontSize: `${fontSize.sm}px`, color: textColor.secondary, lineHeight: 1.4 }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
