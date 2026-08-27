import { View, Text } from "@tarojs/components";
import type { HealthStatus } from "@lieshoucloud/contract-types";

const COLORS: Record<HealthStatus, string> = {
  up: "#52c41a",
  down: "#f5222d",
  degraded: "#faad14",
};

const LABELS: Record<HealthStatus, string> = {
  up: "UP",
  down: "DOWN",
  degraded: "DEGRADED",
};

interface MiniProgramHealthBadgeProps {
  status: HealthStatus;
  serviceName?: string;
}

/**
 * 小程序原生 HealthBadge (Taro View + Text).
 *
 * 与 web HealthBadge (packages/ui) 和 mobile HealthBadge (RN) 同名
 * 但实现完全不同 —— Taro 编译成微信小程序原生组件.
 *
 * 共享: HealthStatus 类型 from @lieshoucloud/types.
 *
 * @see .ai/decisions/0014-mini-program.md
 */
export function MiniProgramHealthBadge({ status, serviceName }: MiniProgramHealthBadgeProps) {
  return (
    <View
      style={{
        backgroundColor: COLORS[status],
        paddingTop: "8rpx",
        paddingBottom: "8rpx",
        paddingLeft: "20rpx",
        paddingRight: "20rpx",
        borderRadius: "8rpx",
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: "24rpx", fontWeight: "bold" }}>
        {serviceName ? `${serviceName}: ` : ""}
        {LABELS[status]}
      </Text>
    </View>
  );
}
