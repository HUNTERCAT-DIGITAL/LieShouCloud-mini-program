/**
 * 列表项 —— 对齐 mobile-ui.md §4.1：图标底 + 1 主行 + 1 副行 + 右侧插槽.
 * 触控目标 ≥ 44×44（rpx ≈ 88），行高 ≥ 48px（rpx ≈ 96）。
 */
import type { ReactNode } from 'react';
import { Text, View } from '@tarojs/components';
import { borderColor, fontSize, radius, spacing, textColor } from '../styles/tokens';

export interface ListCellProps {
  /** 图标底（emoji / 首字符 / 自定义节点），建议 36px 圆角 */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** 右侧插槽（状态徽章 / 数值 / 箭头） */
  right?: ReactNode;
  onClick?: () => void;
}

export default function ListCell({ icon, title, description, right, onClick }: ListCellProps) {
  return (
    <View
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        minHeight: '48px',
        padding: `${spacing.sm}px ${spacing.md}px`,
        backgroundColor: '#fff',
        borderBottom: `0px solid ${borderColor}`,
      }}
    >
      {icon ? (
        <View
          style={{
            width: '36px',
            height: '36px',
            borderRadius: `${radius.md}px`,
            marginRight: `${spacing.md}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${fontSize.xl}px`,
            backgroundColor: '#f0f4ff',
            flexShrink: 0,
          }}
        >
          {icon}
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            display: 'block',
            fontSize: `${fontSize.lg}px`,
            fontWeight: 600,
            color: textColor.main,
            lineHeight: 1.4,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={{
              display: 'block',
              marginTop: `${spacing.xxs}px`,
              fontSize: `${fontSize.sm}px`,
              color: textColor.secondary,
              lineHeight: 1.4,
            }}
            numberOfLines={1}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {right ? <View style={{ marginLeft: `${spacing.sm}px`, flexShrink: 0 }}>{right}</View> : null}
    </View>
  );
}
