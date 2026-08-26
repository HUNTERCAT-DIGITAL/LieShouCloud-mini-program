/**
 * 物联网版告警列表（全角色 · industry-iot）.
 * 级别：WARN 警告 / CRITICAL 严重；状态：PENDING 待处理 / ACKNOWLEDGED 已确认.
 */
import { Text, View } from "@tarojs/components";
import { useEffect, useState } from "react";

import { EmptyState } from "../../../components/MiniUI";
import { iotApi } from "../../../services/industryIot";
import type { AlertLevel, AlertStatus, IotAlert } from "@lieshoucloud/industry-iot";
import { colors } from "../../../theme/colors";

const LEVEL_META: Record<AlertLevel, { text: string; color: string }> = {
  WARN: { text: "警告", color: "#faad14" },
  CRITICAL: { text: "严重", color: "#f5222d" },
};

const STATUS_META: Record<AlertStatus, { text: string; color: string }> = {
  PENDING: { text: "待处理", color: "#f5222d" },
  ACKNOWLEDGED: { text: "已确认", color: "#52c41a" },
};

export default function IotAlerts() {
  const [data, setData] = useState<IotAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setData(await iotApi.listAlerts({}));
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
        <EmptyState message="暂无告警" />
      ) : (
        data.map((a) => (
          <View
            key={a.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12rpx",
              padding: "24rpx",
              marginBottom: "16rpx",
              borderLeft: `6rpx solid ${LEVEL_META[a.level].color}`,
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
              <Text style={{ fontSize: "28rpx", fontWeight: 600, color: colors.text }}>{a.message}</Text>
              <Text style={{ fontSize: "24rpx", color: LEVEL_META[a.level].color }}>
                {LEVEL_META[a.level].text}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "8rpx",
              }}
            >
              <Text style={{ fontSize: "22rpx", color: colors.textSecondary }}>
                {a.createdAt.slice(0, 16).replace("T", " ")}
                {a.actualValue != null && a.threshold != null
                  ? ` · 实测 ${a.actualValue} / 阈值 ${a.threshold}`
                  : ""}
              </Text>
              <Text style={{ fontSize: "22rpx", color: STATUS_META[a.status].color }}>
                {STATUS_META[a.status].text}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
