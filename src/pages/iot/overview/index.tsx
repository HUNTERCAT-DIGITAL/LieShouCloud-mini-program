/**
 * 物联网版总览（IOT_CUSTOMER · industry-iot）.
 * 站点/设备在线概览 + 告警数.
 */
import { Text, View } from "@tarojs/components";
import { useEffect, useState } from "react";

import { EmptyState } from "../../../components/MiniUI";
import { iotApi } from "../../../services/industryIot";
import type { IotOverview } from "@lieshoucloud/industry-iot";
import { colors } from "../../../theme/colors";

export default function IotOverviewPage() {
  const [data, setData] = useState<IotOverview | null>(null);

  const load = async () => {
    try {
      setData(await iotApi.overview());
    } catch {
      setData(null);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (!data) return <EmptyState message="暂无设备数据" />;

  const cards = [
    { label: "设备总数", value: data.total, color: colors.primary },
    { label: "在线", value: data.online, color: colors.success },
    { label: "离线", value: data.offline, color: "#faad14" },
    { label: "未确认告警", value: data.pendingAlerts, color: "#f5222d" },
  ];

  return (
    <View style={{ minHeight: "100vh", padding: "24rpx", backgroundColor: colors.bg }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "24rpx",
          marginBottom: "24rpx",
        }}
      >
        {cards.map((c) => (
          <View
            key={c.label}
            style={{
              width: "45%",
              flexGrow: 1,
              backgroundColor: "#fff",
              borderRadius: "12rpx",
              padding: "32rpx",
              borderTop: `6rpx solid ${c.color}`,
              borderLeft: "1rpx solid #eee",
              borderRight: "1rpx solid #eee",
              borderBottom: "1rpx solid #eee",
            }}
          >
            <Text style={{ fontSize: "24rpx", color: colors.textSecondary }}>{c.label}</Text>
            <Text style={{ fontSize: "48rpx", fontWeight: 700, color: c.color }}>{c.value}</Text>
          </View>
        ))}
      </View>
      {data.maxTemperature != null && (
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: "12rpx",
            padding: "24rpx",
            border: "1rpx solid #eee",
          }}
        >
          <Text style={{ fontSize: "26rpx", color: colors.text }}>
            全站最高节点温度：{data.maxTemperature}℃
          </Text>
        </View>
      )}
    </View>
  );
}
