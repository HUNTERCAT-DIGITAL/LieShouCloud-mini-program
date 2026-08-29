/**
 * 筛选 Chip 组 —— 对齐 mobile-ui.md §4.2（paper Chip）.
 */
import { Text, View } from '@tarojs/components';
import { brandColor, fontSize, radius, spacing, textColor } from '../styles/tokens';

export interface ChipItem {
  key: string;
  label: string;
}

export default function FilterChips({
  items,
  value,
  onChange,
}: {
  items: ChipItem[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={{ display: 'flex', flexWrap: 'wrap', padding: `0 ${spacing.md}rpx` }}>
      {items.map((it) => {
        const active = it.key === value;
        return (
          <View
            key={it.key}
            onClick={() => onChange(it.key)}
            style={{
              margin: `0 ${spacing.sm}rpx ${spacing.sm}rpx 0`,
              padding: `${spacing.xs}rpx ${spacing.md}rpx`,
              borderRadius: `${radius.lg}rpx`,
              backgroundColor: active ? brandColor : '#f0f0f0',
            }}
          >
            <Text
              style={{
                fontSize: `${fontSize.sm}rpx`,
                color: active ? '#fff' : textColor.secondary,
                fontWeight: active ? 600 : 400,
              }}
            >
              {it.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
