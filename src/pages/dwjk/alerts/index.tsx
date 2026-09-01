/**
 * 告警列表（客户仓 deploy:prepare 生成 · 勿手改/勿提交）.
 * 规范：docs/mini-program-architecture.md §5.2 —— 筛选 + 严重度 + 确认闭环；已确认降权。
 */
import { Button, View } from "@tarojs/components";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { useAuthStore } from "@lieshoucloud/core-web";
import { useCallback, useEffect, useState } from "react";

import FilterChips from "@/components/FilterChips";
import ListCell from "@/components/ListCell";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState, ErrorView, LoadingView } from "@/components/Feedback";
import { bgColor, borderColor, fontSize, radius, spacing } from "@/styles/tokens";

import { ackIotAlert, listIotAlerts, listIotDevices, type IotAlert } from "@lieshoucloud/dwjk/api";

function formatRelative(iso?: string | null): string {
  if (!iso) return "-";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return m + " 分钟前";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " 小时前";
  const d = Math.floor(h / 24);
  if (d <= 7) return d + " 天前";
  const dt = new Date(t);
  return (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0") + " " + dt.getHours().toString().padStart(2, "0") + ":" + dt.getMinutes().toString().padStart(2, "0");
}

const FILTERS: { key: "" | "PENDING" | "ACKNOWLEDGED"; label: string }[] = [
  { key: "", label: "全部" },
  { key: "PENDING", label: "待确认" },
  { key: "ACKNOWLEDGED", label: "已确认" },
];

export default function DwjkAlerts() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [filter, setFilter] = useState<"" | "PENDING" | "ACKNOWLEDGED">("PENDING");
  const [alerts, setAlerts] = useState<IotAlert[]>([]);
  const [devNames, setDevNames] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acking, setAcking] = useState<number | null>(null);

  useDidShow(() => {
    if (!isAuthenticated) Taro.reLaunch({ url: "/pages/login/login" });
  });

  const load = useCallback(async () => {
    setError("");
    try {
      const [al, devs] = await Promise.all([
        listIotAlerts({ status: filter, days: 7 }),
        listIotDevices(),
      ]);
      setAlerts(al);
      setDevNames(new Map(devs.map((d) => [d.id, d.name])));
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

  async function handleAck(a: IotAlert) {
    const confirmed = await Taro.showModal({
      title: "确认告警",
      content: (a.ruleName || "告警") + " 已处理？",
      confirmText: "确认",
      confirmColor: "#02429b",
      cancelText: "取消",
    });
    if (!confirmed.confirm) return;
    setAcking(a.id);
    try {
      await ackIotAlert(a.id);
      await load();
      Taro.showToast({ title: "已确认", icon: "success", duration: 1200 });
    } catch (e) {
      Taro.showToast({ title: e instanceof Error ? e.message : "操作失败", icon: "none" });
    } finally {
      setAcking(null);
    }
  }

  const sorted = [...alerts].sort((a, b) => {
    const sev = { CRITICAL: 0, WARN: 1 } as Record<string, number>;
    return (sev[a.severity] ?? 2) - (sev[b.severity] ?? 2);
  });

  return (
    <View style={{ minHeight: "100vh", backgroundColor: bgColor }}>
      <View style={{ padding: spacing.md + "px 0 " + spacing.sm + "px" }}>
        <FilterChips items={FILTERS.map((f) => ({ key: f.key, label: f.label }))} value={filter} onChange={(k) => setFilter(k as "" | "PENDING" | "ACKNOWLEDGED")} />
      </View>

      <View style={{ margin: "0 " + spacing.md + "px", backgroundColor: "#fff", borderRadius: radius.lg + "px", overflow: "hidden", border: "1px solid " + borderColor }}>
        {loading ? (
          <LoadingView />
        ) : error ? (
          <ErrorView text={error} onRetry={load} />
        ) : sorted.length === 0 ? (
          <EmptyState icon="🔔" text={filter === "PENDING" ? "暂无待确认告警" : "暂无告警"} />
        ) : (
          sorted.map((a, i) => {
            const isPending = a.status === "PENDING";
            return (
              <View key={a.id} style={{ borderBottom: i < sorted.length - 1 ? "1px solid " + borderColor : "none" }}>
                <ListCell
                  dimmed={!isPending}
                  icon={isPending ? "!" : "✓"}
                  iconBg={a.severity === "CRITICAL" ? "rgba(245, 34, 45, 0.12)" : "rgba(250, 173, 20, 0.12)"}
                  title={devNames.get(a.deviceId) || "设备 #" + a.deviceId}
                  description={
                    (a.ruleName || "告警") + " · " + (a.actualValue ?? "") +
                    (a.threshold ? " / 阈值 " + a.threshold : "") + " · " + formatRelative(a.createdAt) +
                    (a.ackedBy ? " · " + a.ackedBy : "")
                  }
                  right={
                    <View style={{ display: "flex", alignItems: "center" }}>
                      {isPending ? (
                        <View style={{ marginRight: spacing.sm + "px" }}>
                          <StatusBadge status={a.severity === "CRITICAL" ? "error" : "warning"} text={a.severity === "CRITICAL" ? "紧急" : "警告"} />
                        </View>
                      ) : (
                        <StatusBadge status="offline" text="已确认" />
                      )}
                      {isPending ? (
                        <Button
                          size="mini"
                          loading={acking === a.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAck(a);
                          }}
                          style={{ margin: 0, padding: "0 " + spacing.md + "px", fontSize: fontSize.sm + "px", lineHeight: "32px", backgroundColor: "#02429b", color: "#fff", borderRadius: radius.md + "px", fontWeight: 600 }}
                        >
                          确认
                        </Button>
                      ) : null}
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
