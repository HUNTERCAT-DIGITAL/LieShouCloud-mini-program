/**
 * 值班台首页（客户启动页 · deploy:prepare 生成 · 勿手改/勿提交）.
 * 规范：docs/mini-program-architecture.md §5.1 —— L1 健康横幅 → L2 待确认队列 → L3 指标。
 * UI：端基元组件（@/components + @/styles/tokens）；业务：客户包 api。
 */
import { Button, Image, Text, View } from "@tarojs/components";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { useAuthStore } from "@lieshoucloud/core-web";
import { useCallback, useEffect, useState } from "react";

import logo from "@/assets/logo.png";
import HealthBanner from "@/components/HealthBanner";
import ListCell from "@/components/ListCell";
import StatusBadge from "@/components/StatusBadge";
import StatGrid from "@/components/StatGrid";
import { EmptyState, ErrorView, LoadingView } from "@/components/Feedback";
import { bgColor, borderColor, fontSize, radius, spacing, statusColor, textColor } from "@/styles/tokens";

import { ackIotAlert, getIotOverview, listIotAlerts, listIotDevices, type IotAlert, type IotOverview } from "@lieshoucloud/dwjk/api";

/** 相对时间（规范 §6） */
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
  return (
    (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0") +
    " " + dt.getHours().toString().padStart(2, "0") + ":" + dt.getMinutes().toString().padStart(2, "0")
  );
}

const SEV_ORDER: Record<string, number> = { CRITICAL: 0, WARN: 1 };

export default function DwjkWorkspace() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [overview, setOverview] = useState<IotOverview | null>(null);
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
      const [ov, al, devs] = await Promise.all([
        getIotOverview(),
        listIotAlerts({ status: "PENDING", days: 7 }),
        listIotDevices(),
      ]);
      setOverview(ov);
      setAlerts(al);
      setDevNames(new Map(devs.map((d) => [d.id, d.name])));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

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
      // 本地闭环：移除告警 + 待确认数 -1（不整页重拉）
      setAlerts((prev) => prev.filter((x) => x.id !== a.id));
      setOverview((prev) =>
        prev
          ? {
              ...prev,
              pendingAlerts: Math.max(0, prev.pendingAlerts - 1),
              alertDevices: prev.alertDevices.filter((d) => d.alertId !== a.id),
            }
          : prev
      );
      Taro.showToast({ title: "已确认", icon: "success", duration: 1200 });
    } catch (e) {
      Taro.showToast({ title: e instanceof Error ? e.message : "操作失败", icon: "none" });
    } finally {
      setAcking(null);
    }
  }

  const sorted = [...alerts].sort((a, b) => (SEV_ORDER[a.severity] ?? 2) - (SEV_ORDER[b.severity] ?? 2));
  const maxTempValue = overview?.maxTemperature?.value ?? null;
  const hasProblem = overview ? overview.pendingAlerts > 0 || overview.deviceCount.offline > 0 : false;

  return (
    <View style={{ minHeight: "100vh", backgroundColor: bgColor, padding: spacing.md + "px" }}>
      {/* 品牌 header */}
      <View style={{ backgroundImage: "linear-gradient(135deg, #02429b 0%, #1a5cbf 100%)", borderRadius: radius.lg + "px", padding: spacing.lg + "px " + spacing.lg + "px", marginBottom: spacing.md + "px" }}>
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0 }}>
            <Image src={logo} style={{ width: "44px", height: "44px", borderRadius: "10px", marginRight: spacing.md + "px", flexShrink: 0, backgroundColor: "#fff" }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ display: "block", color: "#fff", fontSize: fontSize.xxl + "px", fontWeight: 700, lineHeight: 1.3 }} numberOfLines={1}>电网监控</Text>
              <Text style={{ display: "block", marginTop: spacing.xs + "px", color: "rgba(255,255,255,0.85)", fontSize: fontSize.sm + "px" }} numberOfLines={1}>变电站 · 配电设备监测 · 值班台</Text>
            </View>
          </View>
          <View
            onClick={() => Taro.navigateTo({ url: "/pages/dwjk/mine/index" })}
            style={{ display: "flex", alignItems: "center", padding: spacing.sm + "px " + spacing.xs + "px", marginRight: -spacing.xs + "px" }}
          >
            <Text style={{ color: "rgba(255,255,255,0.95)", fontSize: fontSize.md + "px", fontWeight: 600 }}>我的</Text>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: fontSize.lg + "px", marginLeft: spacing.xs + "px" }}>›</Text>
          </View>
        </View>
        <View style={{ marginTop: spacing.md + "px", display: "flex", flexDirection: "row" }}>
          <View style={{ marginRight: spacing.lg + "px" }}>
            <Text style={{ display: "block", color: "#fff", fontSize: fontSize.xl + "px", fontWeight: 700, lineHeight: 1.2 }}>{overview ? overview.deviceCount.online : "-"}</Text>
            <Text style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: fontSize.xs + "px", marginTop: spacing.xxs + "px" }}>在线设备</Text>
          </View>
          <View style={{ marginRight: spacing.lg + "px" }}>
            <Text style={{ display: "block", color: "#fff", fontSize: fontSize.xl + "px", fontWeight: 700, lineHeight: 1.2 }}>{overview ? overview.pendingAlerts : "-"}</Text>
            <Text style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: fontSize.xs + "px", marginTop: spacing.xxs + "px" }}>待确认</Text>
          </View>
          <View>
            <Text style={{ display: "block", color: "#fff", fontSize: fontSize.xl + "px", fontWeight: 700, lineHeight: 1.2 }}>{overview ? overview.deviceCount.offline : "-"}</Text>
            <Text style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: fontSize.xs + "px", marginTop: spacing.xxs + "px" }}>离线</Text>
          </View>
        </View>
      </View>

      {/* L1 健康横幅 */}
      {overview && (
        <HealthBanner
          status={hasProblem ? "error" : "success"}
          title={hasProblem ? overview.pendingAlerts + " 项需要关注" : "全站运行正常"}
          subtitle={
            overview.deviceCount.online + "/" + overview.deviceCount.total + " 在线 · 待确认 " +
            overview.pendingAlerts + " · 离线 " + overview.deviceCount.offline +
            (maxTempValue !== null ? " · 最高 " + maxTempValue + "℃" : "")
          }
        />
      )}

      {/* L3 概览指标 */}
      {overview && (
        <View style={{ marginTop: spacing.md + "px" }}>
          <StatGrid
            items={[
              { label: "设备总数", value: overview.deviceCount.total },
              { label: "在线", value: overview.deviceCount.online, color: statusColor.success },
              { label: "离线", value: overview.deviceCount.offline, color: overview.deviceCount.offline > 0 ? statusColor.error : undefined },
              { label: "今日告警", value: overview.alertsToday, color: overview.alertsToday > 0 ? statusColor.warning : undefined },
              { label: "待确认", value: overview.pendingAlerts, color: overview.pendingAlerts > 0 ? statusColor.error : undefined },
              { label: "最高温度", value: maxTempValue !== null ? maxTempValue + "℃" : "-" },
            ]}
          />
        </View>
      )}

      {/* L4 快捷入口 */}
      <View style={{ marginTop: spacing.md + "px", display: "flex" }}>
        <View onClick={() => Taro.navigateTo({ url: "/pages/dwjk/devices/index" })} style={{ flex: 1, backgroundColor: "#fff", borderRadius: radius.lg + "px", border: "1px solid " + borderColor, padding: spacing.md + "px", display: "flex", alignItems: "center", marginRight: spacing.sm + "px" }}>
          <Text style={{ fontSize: fontSize.lg + "px", marginRight: spacing.sm + "px" }}>📡</Text>
          <Text style={{ fontSize: fontSize.md + "px", fontWeight: 600, color: textColor.main }}>设备列表</Text>
          <Text style={{ marginLeft: "auto", fontSize: fontSize.lg + "px", color: textColor.assist }}>›</Text>
        </View>
        <View onClick={() => Taro.navigateTo({ url: "/pages/dwjk/ops/index" })} style={{ flex: 1, backgroundColor: "#fff", borderRadius: radius.lg + "px", border: "1px solid " + borderColor, padding: spacing.md + "px", display: "flex", alignItems: "center" }}>
          <Text style={{ fontSize: fontSize.lg + "px", marginRight: spacing.sm + "px" }}>🎫</Text>
          <Text style={{ fontSize: fontSize.md + "px", fontWeight: 600, color: textColor.main }}>工单</Text>
          <Text style={{ marginLeft: "auto", fontSize: fontSize.lg + "px", color: textColor.assist }}>›</Text>
        </View>
      </View>

      {/* L2 待确认告警队列 */}
      <View style={{ marginTop: spacing.lg + "px", marginBottom: spacing.sm + "px", padding: "0 " + spacing.xs + "px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: fontSize.lg + "px", fontWeight: 700, color: textColor.main }}>待确认告警</Text>
        <View style={{ display: "flex", alignItems: "center" }}>
          <Text style={{ fontSize: fontSize.sm + "px", color: textColor.secondary, marginRight: spacing.sm + "px" }}>共 {sorted.length} 条</Text>
          <Text onClick={() => Taro.navigateTo({ url: "/pages/dwjk/alerts/index" })} style={{ fontSize: fontSize.sm + "px", color: "#02429b", fontWeight: 600 }}>查看全部 ›</Text>
        </View>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: radius.lg + "px", overflow: "hidden", border: "1px solid " + borderColor }}>
        {loading ? (
          <LoadingView />
        ) : error ? (
          <ErrorView text={error} onRetry={load} />
        ) : sorted.length === 0 ? (
          <EmptyState icon="✅" text="暂无待确认告警" />
        ) : (
          sorted.map((a, i) => (
            <View key={a.id} style={{ borderBottom: i < sorted.length - 1 ? "1px solid " + borderColor : "none" }}>
              <ListCell
                icon={a.severity === "CRITICAL" ? "!" : "!"}
                iconBg={a.severity === "CRITICAL" ? "rgba(245, 34, 45, 0.12)" : "rgba(250, 173, 20, 0.12)"}
                title={devNames.get(a.deviceId) || "设备 #" + a.deviceId}
                description={
                  (a.ruleName || "告警") + " · " + (a.actualValue ?? "") +
                  (a.threshold ? " / 阈值 " + a.threshold : "") + " · " + formatRelative(a.createdAt)
                }
                right={
                  <View style={{ display: "flex", alignItems: "center" }}>
                    <View style={{ marginRight: spacing.sm + "px" }}>
                      <StatusBadge status={a.severity === "CRITICAL" ? "error" : "warning"} text={a.severity === "CRITICAL" ? "紧急" : "警告"} />
                    </View>
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
                  </View>
                }
              />
            </View>
          ))
        )}
      </View>


    </View>
  );
}
