/**
 * 统计卡网格 —— 对齐 mobile-ui.md §4.4：数字大号加粗 + 标签次要；异常指标带色点 + 着色。
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
          <View style={{ display: 'flex', alignItems: 'center' }}>
            {it.color ? (
              <View
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: it.color,
                  marginRight: `${spacing.xs}px`,
                }}
              />
            ) : null}
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
          </View>
          <Text style={{ marginTop: `${spacing.xxs}px`, fontSize: `${fontSize.xs}px`, color: textColor.secondary }}>
            {it.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
