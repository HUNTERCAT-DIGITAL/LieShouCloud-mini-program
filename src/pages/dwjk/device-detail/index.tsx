/**
 * 设备详情（客户仓 deploy:prepare 生成 · 勿手改/勿提交）.
 * 规范：docs/mini-program-architecture.md §5.4 —— L1 状态头 → L2 未确认告警 → L3 节点温度网格 → L4 遥测折线。
 */
import { Canvas, Text, View } from "@tarojs/components";
import Taro, { useDidShow, useRouter } from "@tarojs/taro";
import { useAuthStore } from "@lieshoucloud/core-web";
import { useCallback, useEffect, useMemo, useState } from "react";

import FilterChips from "@/components/FilterChips";
import ListCell from "@/components/ListCell";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState, ErrorView, LoadingView } from "@/components/Feedback";
import { bgColor, borderColor, brandColor, fontSize, radius, spacing, statusColor, textColor } from "@/styles/tokens";

import { getIotDeviceDetail, getIotDeviceHistory, listIotAlerts, type IotAlert, type IotDeviceDetail } from "@lieshoucloud/dwjk/api";

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

function tempColor(t: number): string {
  if (t >= 70) return statusColor.error;
  if (t >= 60) return statusColor.warning;
  return textColor.main;
}

/** 画折线（Canvas 2D） */
function drawLineChart(
  canvas: unknown,
  ctx: { clearRect: (x: number, y: number, w: number, h: number) => void; beginPath: () => void; moveTo: (x: number, y: number) => void; lineTo: (x: number, y: number) => void; stroke: () => void; arc: (x: number, y: number, r: number, a: number, b: number) => void; fill: () => void; strokeStyle: string; lineWidth: number; fillStyle: string },
  width: number,
  height: number,
  values: number[],
) {
  if (!ctx || values.length === 0) return;
  ctx.clearRect(0, 0, width, height);
  const pad = 8;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // 水平网格 3 条
  ctx.strokeStyle = "#f0f0f0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = pad + ((height - pad * 2) * i) / 3;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }

  // 折线
  ctx.strokeStyle = brandColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = pad + ((width - pad * 2) * i) / (values.length - 1 || 1);
    const y = pad + (height - pad * 2) * (1 - (v - min) / range);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // 数据点
  values.forEach((v, i) => {
    const x = pad + ((width - pad * 2) * i) / (values.length - 1 || 1);
    const y = pad + (height - pad * 2) * (1 - (v - min) / range);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = brandColor;
    ctx.fill();
  });
}

export default function DwjkDeviceDetail() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const id = Number(router.params.id ?? 0);

  const [detail, setDetail] = useState<IotDeviceDetail | null>(null);
  const [pendingAlerts, setPendingAlerts] = useState<IotAlert[]>([]);
  const [history, setHistory] = useState<{ v: number; t: string }[]>([]);
  const [propKey, setPropKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useDidShow(() => {
    if (!isAuthenticated) Taro.reLaunch({ url: "/pages/login/login" });
  });

  // 节点温度（shadow node{n}_temperature）
  const nodeProps = useMemo(() => {
    const sh = detail?.shadow ?? {};
    return Object.keys(sh)
      .filter((k) => /^noded+_temperature$/.test(k))
      .sort((a, b) => Number(a.replace(/D/g, "")) - Number(b.replace(/D/g, "")));
  }, [detail]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const d = await getIotDeviceDetail(id);
      setDetail(d);
      const al = await listIotAlerts({ deviceId: id, status: "PENDING" });
      setPendingAlerts(al);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // 遥测加载（属性切换时）
  useEffect(() => {
    if (!id || !propKey) {
      setHistory([]);
      return;
    }
    getIotDeviceHistory(id, { propertyKey: propKey, days: 1 })
      .then((pts) =>
        setHistory(
          pts
            .map((p) => ({ v: Number(p.valueStr), t: p.reportedAt }))
            .filter((p) => !Number.isNaN(p.v))
            .slice(-24)
        )
      )
      .catch(() => setHistory([]));
  }, [id, propKey]);

  // 默认选第一个温度节点
  useEffect(() => {
    if (nodeProps.length > 0 && !propKey) setPropKey(nodeProps[0]);
  }, [nodeProps, propKey]);

  // 画折线
  useEffect(() => {
    if (history.length < 2) return;
    Taro.nextTick(() => {
      Taro.createSelectorQuery()
        .select("#chart")
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0] && res[0].node) {
            const { node, width, height } = res[0];
            const ctx = node.getContext("2d");
            drawLineChart(node, ctx, width, height, history.map((h) => h.v));
          }
        });
    });
  }, [history, propKey]);

  const online = detail?.device?.status === "ONLINE";
  const nodeTemps = nodeProps.map((k) => ({ key: k, value: Number(detail?.shadow?.[k]) })).filter((n) => !Number.isNaN(n.value));
  const sortedAlerts = [...pendingAlerts].sort((a, b) => (a.severity === "CRITICAL" ? 0 : 1) - (b.severity === "CRITICAL" ? 0 : 1));

  return (
    <View style={{ minHeight: "100vh", backgroundColor: bgColor, padding: spacing.md + "px" }}>
      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView text={error} onRetry={load} />
      ) : (
        <View>
          {/* L1 状态头 */}
          <View style={{ backgroundColor: "#fff", borderRadius: radius.lg + "px", padding: spacing.lg + "px", marginBottom: spacing.md + "px", display: "flex", alignItems: "center" }}>
            <View style={{ width: "48px", height: "48px", borderRadius: "24px", backgroundColor: online ? "rgba(82,196,26,0.12)" : "rgba(191,191,191,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: spacing.md + "px", flexShrink: 0 }}>
              <Text style={{ fontSize: fontSize.xl + "px" }}>{online ? "🟢" : "⚪"}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ display: "block", fontSize: fontSize.lg + "px", fontWeight: 700, color: textColor.main }} numberOfLines={1}>
                {detail?.device?.name || "设备 #" + id}
              </Text>
              <Text style={{ display: "block", marginTop: spacing.xxs + "px", fontSize: fontSize.sm + "px", color: textColor.secondary }} numberOfLines={1}>
                {detail?.device?.groupName || "未分组"}
                {detail?.device?.installAddress ? " · " + detail.device.installAddress : ""}
              </Text>
            </View>
            <View style={{ marginLeft: spacing.sm + "px", flexShrink: 0 }}>
              <StatusBadge status={online ? "success" : "offline"} text={online ? "在线" : "离线"} />
            </View>
          </View>

          {/* L3 节点温度网格 */}
          {nodeTemps.length > 0 ? (
            <View style={{ marginBottom: spacing.md + "px" }}>
              <Text style={{ fontSize: fontSize.md + "px", fontWeight: 700, color: textColor.main, marginBottom: spacing.sm + "px" }}>节点温度</Text>
              <View style={{ display: "flex", flexWrap: "wrap", backgroundColor: "#fff", borderRadius: radius.lg + "px", padding: spacing.sm + "px 0" }}>
                {nodeTemps.map((n) => (
                  <View key={n.key} style={{ width: "33.33%", display: "flex", flexDirection: "column", alignItems: "center", padding: spacing.sm + "px 0" }}>
                    <Text style={{ fontSize: fontSize.lg + "px", fontWeight: 700, color: tempColor(n.value) }}>{n.value}℃</Text>
                    <Text style={{ marginTop: spacing.xxs + "px", fontSize: fontSize.xs + "px", color: textColor.secondary }}>{n.key.replace("_temperature", "").toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* L2 未确认告警 */}
          <View style={{ marginBottom: spacing.md + "px" }}>
            <Text style={{ fontSize: fontSize.md + "px", fontWeight: 700, color: textColor.main, marginBottom: spacing.sm + "px" }}>
              未确认告警（{sortedAlerts.length}）
            </Text>
            {sortedAlerts.length === 0 ? (
              <Text style={{ fontSize: fontSize.sm + "px", color: textColor.secondary }}>暂无未确认告警</Text>
            ) : (
              <View style={{ backgroundColor: "#fff", borderRadius: radius.lg + "px", overflow: "hidden", border: "1px solid " + borderColor }}>
                {sortedAlerts.map((a, i) => (
                  <View key={a.id} style={{ borderBottom: i < sortedAlerts.length - 1 ? "1px solid " + borderColor : "none" }}>
                    <ListCell
                      icon="!"
                      iconBg={a.severity === "CRITICAL" ? "rgba(245,34,45,0.12)" : "rgba(250,173,20,0.12)"}
                      title={a.ruleName || "告警"}
                      description={(a.actualValue ?? "") + (a.threshold ? " / 阈值 " + a.threshold : "") + " · " + formatRelative(a.createdAt)}
                      right={<StatusBadge status={a.severity === "CRITICAL" ? "error" : "warning"} text={a.severity === "CRITICAL" ? "紧急" : "警告"} />}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* L4 遥测折线 */}
          {nodeProps.length > 0 ? (
            <View style={{ backgroundColor: "#fff", borderRadius: radius.lg + "px", border: "1px solid " + borderColor, padding: spacing.md + "px" }}>
              <Text style={{ fontSize: fontSize.md + "px", fontWeight: 700, color: textColor.main, marginBottom: spacing.sm + "px" }}>遥测趋势</Text>
              <View style={{ marginBottom: spacing.md + "px" }}>
                <FilterChips
                  items={nodeProps.map((k) => ({ key: k, label: k.replace("_temperature", "").toUpperCase() }))}
                  value={propKey}
                  onChange={setPropKey}
                />
              </View>
              {history.length < 2 ? (
                <EmptyState icon="📈" text="暂无遥测数据" />
              ) : (
                <View>
                  <Canvas id="chart" type="2d" style={{ width: "100%", height: "160px" }} canvasId="chart" />
                  <Text style={{ display: "block", marginTop: spacing.sm + "px", fontSize: fontSize.xs + "px", color: textColor.secondary }}>
                    最近 {history.length} 个点 · 当前 {history[history.length - 1].v}（{formatRelative(history[history.length - 1].t)}）
                  </Text>
                </View>
              )}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
