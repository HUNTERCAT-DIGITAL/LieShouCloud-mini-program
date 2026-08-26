/**
 * 物联网版设备列表（IOT_OPERATOR · industry-iot）.
 * 状态：ONLINE 在线 / OFFLINE 离线 / UNKNOWN 未知.
 */
import { Text, View } from "@tarojs/components";
import { useEffect, useState } from "react";

import { EmptyState } from "../../../components/MiniUI";
import { iotApi } from "../../../services/industryIot";
import type { DeviceStatus, IotDevice } from "@lieshoucloud/industry-iot";
import { colors } from "../../../theme/colors";

const STATUS_META: Record<DeviceStatus, { text: string; color: string }> = {
  ONLINE: { text: "在线", color: "#52c41a" },
  OFFLINE: { text: "离线", color: "#faad14" },
  UNKNOWN: { text: "未知", color: "#999" },
};

export default function IotDevices() {
  const [data, setData] = useState<IotDevice[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setData(await iotApi.listDevices({}));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ minHeight: "100vh", padding: "24rpx", backgroundColor: colors.bg }}>
      {data.length === 0 && !loading ? (
        <EmptyState message="暂无设备" />
      ) : (
        data.map((d) => (
          <View
            key={d.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12rpx",
              padding: "24rpx",
              marginBottom: "16rpx",
              border: "1rpx solid #eee",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: "28rpx", fontWeight: 600, color: colors.text }}>
                {d.name ?? d.deviceKey}
              </Text>
              <Text style={{ fontSize: "24rpx", color: STATUS_META[d.status].color }}>
                {STATUS_META[d.status].text}
              </Text>
            </View>
            <Text style={{ fontSize: "24rpx", color: colors.textSecondary, marginTop: "8rpx" }}>
              {d.deviceKey}
              {d.maxTemperature != null ? ` · ${d.maxTemperature}℃` : ""}
              {d.pendingAlerts ? ` · ${d.pendingAlerts} 条告警` : ""}
            </Text>
            {d.installAddress && (
              <Text style={{ fontSize: "22rpx", color: colors.textSecondary, marginTop: "4rpx" }}>
                {d.installAddress}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}
