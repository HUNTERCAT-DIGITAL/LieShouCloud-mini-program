/**
 * 统计卡网格 —— 对齐 mobile-ui.md §4.4：数字 16/700 + 标签 11/次要色，中性统计降权.
 * 3 列 grid；支持单卡着色（异常指标用状态色）。
 */
import { Text, View } from '@tarojs/components';
import { fontSize, radius, spacing, textColor } from '../styles/tokens';

export interface StatItem {
  label: string;
  value: string | number;
  /** 异常指标着色（如 error/warning），缺省主文本色 */
  color?: string;
}

export default function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <View
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        borderRadius: `${radius.lg}px`,
        padding: `${spacing.md}px 0`,
      }}
    >
      {items.map((it) => (
        <View
          key={it.label}
          style={{
            width: '33.33%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: `${spacing.xs}px 0`,
          }}
        >
          <Text
            style={{
              fontSize: `${fontSize.xl}px`,
              fontWeight: 700,
              lineHeight: 1.3,
              color: it.color ?? textColor.main,
            }}
          >
            {it.value}
          </Text>
          <Text style={{ marginTop: `${spacing.xxs}px`, fontSize: `${fontSize.xs}px`, color: textColor.secondary }}>
            {it.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
