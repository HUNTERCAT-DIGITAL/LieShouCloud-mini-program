/**
 * 设备列表（客户仓 deploy:prepare 生成 · 勿手改/勿提交）.
 * 规范：docs/mini-program-architecture.md §5.3 —— 筛选 + 状态点 + 告警数角标 + 温度染色。
 */
import { Text, View } from "@tarojs/components";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { useAuthStore } from "@lieshoucloud/core-web";
import { useCallback, useEffect, useState } from "react";

import FilterChips from "@/components/FilterChips";
import ListCell from "@/components/ListCell";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState, ErrorView, LoadingView } from "@/components/Feedback";
import { bgColor, borderColor, fontSize, radius, spacing, statusColor, textColor } from "@/styles/tokens";

import { listIotDevices, type IotDevice } from "@lieshoucloud/dwjk/api";

const FILTERS: { key: "" | "ONLINE" | "OFFLINE"; label: string }[] = [
  { key: "", label: "全部" },
  { key: "ONLINE", label: "在线" },
  { key: "OFFLINE", label: "离线" },
];

export default function DwjkDevices() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [filter, setFilter] = useState<"" | "ONLINE" | "OFFLINE">("");
  const [devices, setDevices] = useState<IotDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useDidShow(() => {
    if (!isAuthenticated) Taro.reLaunch({ url: "/pages/login/login" });
  });

  const load = useCallback(async () => {
    setError("");
    try {
      setDevices(await listIotDevices({ status: filter }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  usePullDownRefresh(async () => {
    await load();
    Taro.stopPullDownRefresh();
  });

  function tempColor(t?: number | null): string {
    if (typeof t !== "number") return textColor.main;
    if (t >= 70) return statusColor.error;
    if (t >= 60) return statusColor.warning;
    return textColor.main;
  }

  return (
    <View style={{ minHeight: "100vh", backgroundColor: bgColor }}>
      <View style={{ padding: spacing.md + "px 0 " + spacing.sm + "px" }}>
        <FilterChips items={FILTERS.map((f) => ({ key: f.key, label: f.label }))} value={filter} onChange={(k) => setFilter(k as "" | "ONLINE" | "OFFLINE")} />
      </View>

      <View style={{ margin: "0 " + spacing.md + "px", backgroundColor: "#fff", borderRadius: radius.lg + "px", overflow: "hidden", border: "1px solid " + borderColor }}>
        {loading ? (
          <LoadingView />
        ) : error ? (
          <ErrorView text={error} onRetry={load} />
        ) : devices.length === 0 ? (
          <EmptyState icon="📡" text="暂无设备" />
        ) : (
          devices.map((d, i) => {
            const online = d.status === "ONLINE";
            return (
              <View key={d.id} style={{ borderBottom: i < devices.length - 1 ? "1px solid " + borderColor : "none" }}>
                <ListCell
                  icon={online ? "🟢" : "⚪"}
                  iconBg={online ? "rgba(82, 196, 26, 0.12)" : "rgba(191, 191, 191, 0.12)"}
                  title={
                    <Text style={{ fontSize: fontSize.lg + "px", fontWeight: 600, color: textColor.main }}>
                      {d.name}
                      {d.pendingAlerts > 0 ? <Text style={{ color: statusColor.error, fontWeight: 700 }}> ({d.pendingAlerts} 告警)</Text> : null}
                    </Text>
                  }
                  description={
                    <Text style={{ fontSize: fontSize.sm + "px", color: textColor.secondary }}>
                      {d.groupName || "未分组"}
                      {d.maxTemperature !== null ? <Text style={{ color: tempColor(d.maxTemperature) }}> · {d.maxTemperature}℃</Text> : null}
                    </Text>
                  }
                  onClick={() => Taro.navigateTo({ url: "/pages/dwjk/device-detail/index?id=" + d.id })}
                  right={
                    <View>
                      <StatusBadge status={online ? "success" : "offline"} text={online ? "在线" : "离线"} />
                    </View>
                  }
                />
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
