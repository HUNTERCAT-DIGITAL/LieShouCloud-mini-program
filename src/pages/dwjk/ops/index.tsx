/**
 * 运维工单看板（客户仓 deploy:prepare 生成 · 勿手改/勿提交）.
 * 规范：docs/mini-program-architecture.md §5.5 —— KPI 2×2 + 状态/优先级筛选 + 工单卡片 + 派单/闭环。
 * 对齐 mobile TicketsBoard：待派单/高优先级/处置中/今日闭环；PENDING→派单 / HANDLING→闭环。
 * 状态机 PENDING → HANDLING → CLOSED；异常优先排序；下拉刷新。
 */
import { Button, ScrollView, Text, Textarea, View } from "@tarojs/components";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { listUsers, useAuthStore } from "@lieshoucloud/core-web";
import type { User } from "@lieshoucloud/contract-types/business/user";
import { useCallback, useEffect, useState } from "react";

import FilterChips from "@/components/FilterChips";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState, ErrorView, LoadingView } from "@/components/Feedback";
import {
  bgColor, borderColor, brandColor, fontSize, radius, spacing, statusColor, textColor,
} from "@/styles/tokens";

import {
  assignOpsTicket, closeOpsTicket, getGridOpsSummary, listOpsTickets,
  type OpsTicket, type OpsTicketStatus,
} from "@lieshoucloud/dwjk/api";

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
  return (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0") + " " + dt.getHours().toString().padStart(2, "0") + ":" + dt.getMinutes().toString().padStart(2, "0");
}

const STATUS_META: Record<OpsTicketStatus, { text: string; status: "error" | "warning" | "success" }> = {
  PENDING: { text: "待派单", status: "error" },
  HANDLING: { text: "处置中", status: "warning" },
  CLOSED: { text: "已闭环", status: "success" },
};

const PRIORITY_META: Record<OpsTicket["priority"], { text: string; color: string; bg: string }> = {
  HIGH: { text: "高", color: statusColor.error, bg: "rgba(245, 34, 45, 0.08)" },
  MEDIUM: { text: "中", color: statusColor.warning, bg: "rgba(250, 173, 20, 0.08)" },
  LOW: { text: "低", color: statusColor.success, bg: "rgba(82, 196, 26, 0.08)" },
};

const STATUS_RANK: Record<OpsTicketStatus, number> = { PENDING: 0, HANDLING: 1, CLOSED: 2 };
const PRIORITY_RANK: Record<OpsTicket["priority"], number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const STATUS_FILTERS: { key: "" | OpsTicketStatus; label: string }[] = [
  { key: "", label: "全部" },
  { key: "PENDING", label: "待派单" },
  { key: "HANDLING", label: "处置中" },
  { key: "CLOSED", label: "已闭环" },
];

const PRIORITY_FILTERS: { key: "" | OpsTicket["priority"]; label: string }[] = [
  { key: "", label: "全部" },
  { key: "HIGH", label: "高" },
  { key: "MEDIUM", label: "中" },
  { key: "LOW", label: "低" },
];

interface GridOpsSummary { open: number; handling: number; closedToday: number; highPriority: number }

export default function DwjkOps() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [tickets, setTickets] = useState<OpsTicket[]>([]);
  const [summary, setSummary] = useState<GridOpsSummary | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | OpsTicketStatus>("");
  const [priorityFilter, setPriorityFilter] = useState<"" | OpsTicket["priority"]>("");
  const [assigning, setAssigning] = useState<OpsTicket | null>(null);
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [closing, setClosing] = useState<OpsTicket | null>(null);
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useDidShow(() => {
    if (!isAuthenticated) Taro.reLaunch({ url: "/pages/login/login" });
  });

  const load = useCallback(async () => {
    setError("");
    try {
      const [ts, sm] = await Promise.all([listOpsTickets(), getGridOpsSummary()]);
      setTickets(ts);
      setSummary(sm);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    listUsers().then(setUsers).catch(() => {});
  }, [load]);

  usePullDownRefresh(async () => {
    await load();
    Taro.stopPullDownRefresh();
  });

  /** 异常优先排序 + 筛选 */
  const sorted = tickets
    .filter(
      (tk) =>
        (!statusFilter || tk.status === statusFilter) &&
        (!priorityFilter || tk.priority === priorityFilter),
    )
    .sort(
      (a, b) =>
        STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
        PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  /** 派单（PENDING → HANDLING · 指派系统用户 userId + 站内通知） */
  async function handleAssign() {
    if (!assigning || assigneeId === null) return;
    const u = users.find((x) => x.id === assigneeId);
    if (!u) return;
    setSubmitting(true);
    try {
      await assignOpsTicket(assigning.id, u.displayName || u.username, u.id);
      setAssigning(null);
      setAssigneeId(null);
      await load();
      Taro.showToast({ title: "已派单", icon: "success", duration: 1200 });
    } catch (e) {
      Taro.showToast({ title: e instanceof Error ? e.message : "派单失败", icon: "none" });
    } finally {
      setSubmitting(false);
    }
  }

  /** 闭环（HANDLING → CLOSED · 处置备注） */
  async function handleClose() {
    if (!closing) return;
    setSubmitting(true);
    try {
      await closeOpsTicket(closing.id, remark.trim() || undefined);
      setClosing(null);
      setRemark("");
      await load();
      Taro.showToast({ title: "已闭环", icon: "success", duration: 1200 });
    } catch (e) {
      Taro.showToast({ title: e instanceof Error ? e.message : "闭环失败", icon: "none" });
    } finally {
      setSubmitting(false);
    }
  }

  const kpis: { label: string; value: string | number; color: string }[] = [
    { label: "待派单", value: summary?.open ?? "-", color: statusColor.error },
    { label: "高优先级", value: summary?.highPriority ?? "-", color: statusColor.error },
    { label: "处置中", value: summary?.handling ?? "-", color: statusColor.warning },
    { label: "今日闭环", value: summary?.closedToday ?? "-", color: statusColor.success },
  ];

  return (
    <View style={{ minHeight: "100vh", backgroundColor: bgColor, paddingBottom: spacing.xl + "px" }}>
      {/* KPI 2×2 */}
      <View style={{ display: "flex", flexWrap: "wrap", padding: spacing.md + "px " + spacing.sm + "px " + spacing.xs + "px" }}>
        {kpis.map((k) => (
          <View key={k.label} style={{ width: "50%", boxSizing: "border-box", padding: "0 " + spacing.xs + "px", marginBottom: spacing.sm + "px" }}>
            <View style={{ backgroundColor: "#fff", borderRadius: radius.lg + "px", padding: spacing.md + "px", display: "flex", alignItems: "baseline" }}>
              <Text style={{ fontSize: fontSize.xl + "px", fontWeight: 700, lineHeight: 1.3, color: k.color }}>{k.value}</Text>
              <Text style={{ marginLeft: spacing.sm + "px", fontSize: fontSize.xs + "px", color: textColor.secondary }}>{k.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 状态筛选 */}
      <View style={{ marginBottom: spacing.xs + "px" }}>
        <FilterChips items={STATUS_FILTERS} value={statusFilter} onChange={(k) => setStatusFilter(k as "" | OpsTicketStatus)} />
      </View>

      {/* 优先级筛选 */}
      <View style={{ marginBottom: spacing.xs + "px" }}>
        <FilterChips items={PRIORITY_FILTERS} value={priorityFilter} onChange={(k) => setPriorityFilter(k as "" | OpsTicket["priority"])} />
      </View>

      {/* 工单卡片列表 */}
      <View style={{ padding: "0 " + spacing.md + "px" }}>
        {loading ? (
          <LoadingView />
        ) : error ? (
          <ErrorView text={error} onRetry={load} />
        ) : sorted.length === 0 ? (
          <EmptyState icon="🎫" text={statusFilter || priorityFilter ? "无匹配工单" : "暂无工单"} />
        ) : (
          sorted.map((tk) => {
            const sm = STATUS_META[tk.status];
            const pm = PRIORITY_META[tk.priority];
            return (
              <View key={tk.id} style={{ backgroundColor: "#fff", borderRadius: radius.lg + "px", border: "1px solid " + borderColor, padding: spacing.md + "px", marginBottom: spacing.sm + "px" }}>
                <View style={{ display: "flex", alignItems: "center" }}>
                  <StatusBadge status={sm.status} text={sm.text} />
                  <Text style={{ marginLeft: spacing.sm + "px", fontSize: fontSize.xs + "px", color: pm.color, backgroundColor: pm.bg, padding: spacing.xxs + "px " + spacing.sm + "px", borderRadius: radius.sm + "px", fontWeight: 600 }}>{pm.text}优先级</Text>
                  <Text style={{ marginLeft: "auto", fontSize: fontSize.sm + "px", color: textColor.assist }}>#{tk.id}</Text>
                </View>
                <Text style={{ display: "block", marginTop: spacing.sm + "px", fontSize: fontSize.lg + "px", fontWeight: 600, color: textColor.main }} numberOfLines={1}>{tk.deviceName}</Text>
                <Text style={{ display: "block", marginTop: spacing.xxs + "px", fontSize: fontSize.sm + "px", color: textColor.secondary }} numberOfLines={1}>
                  {tk.station ? "站点 " + tk.station + " · " : ""}处理人 {tk.assignee ?? "待派单"}
                </Text>
                <View style={{ marginTop: spacing.sm + "px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: fontSize.sm + "px", color: textColor.assist }}>{formatRelative(tk.createdAt)}</Text>
                  <View style={{ display: "flex" }}>
                    {tk.status === "PENDING" ? (
                      <Button
                        size="mini"
                        loading={submitting && assigning?.id === tk.id}
                        onClick={(e) => { e.stopPropagation(); setAssigning(tk); setAssigneeId(null); }}
                        style={{ margin: 0, padding: "0 " + spacing.md + "px", fontSize: fontSize.sm + "px", lineHeight: "32px", backgroundColor: brandColor, color: "#fff", borderRadius: radius.md + "px", fontWeight: 600 }}
                      >
                        派单
                      </Button>
                    ) : null}
                    {tk.status === "HANDLING" ? (
                      <Button
                        size="mini"
                        loading={submitting && closing?.id === tk.id}
                        onClick={(e) => { e.stopPropagation(); setClosing(tk); setRemark(""); }}
                        style={{ margin: 0, padding: "0 " + spacing.md + "px", fontSize: fontSize.sm + "px", lineHeight: "32px", backgroundColor: "#fff", color: brandColor, borderRadius: radius.md + "px", fontWeight: 600, border: "1px solid " + brandColor }}
                      >
                        闭环
                      </Button>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* 派单弹层（选择处理人） */}
      {assigning ? (
        <View style={{ position: "fixed", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setAssigning(null)}>
          <View style={{ width: "100%", backgroundColor: "#fff", borderTopLeftRadius: radius.lg + "px", borderTopRightRadius: radius.lg + "px", padding: spacing.xl + "px " + spacing.lg + "px " + spacing.xl + "px" }} onClick={(e) => e.stopPropagation()}>
            <Text style={{ display: "block", fontSize: fontSize.lg + "px", fontWeight: 700, color: textColor.main }}>派单 · #{assigning.id}</Text>
            <Text style={{ display: "block", marginTop: spacing.xs + "px", fontSize: fontSize.sm + "px", color: textColor.secondary }}>
              {assigning.deviceName}{assigning.station ? " · " + assigning.station : ""}
            </Text>
            <ScrollView scrollY style={{ maxHeight: "320px", marginTop: spacing.md + "px" }}>
              {users.length === 0 ? (
                <Text style={{ fontSize: fontSize.sm + "px", color: textColor.assist, padding: spacing.md + "px 0" }}>暂无可用处理人</Text>
              ) : (
                users.map((u) => {
                  const selected = assigneeId === u.id;
                  return (
                    <View
                      key={u.id}
                      onClick={() => setAssigneeId(u.id)}
                      style={{ display: "flex", alignItems: "center", padding: spacing.md + "px", borderRadius: radius.md + "px", border: "1px solid " + (selected ? brandColor : borderColor), backgroundColor: selected ? "rgba(2, 66, 155, 0.06)" : "#fff", marginBottom: spacing.sm + "px" }}
                    >
                      <Text style={{ flex: 1, fontSize: fontSize.md + "px", fontWeight: selected ? 600 : 400, color: textColor.main }}>{u.displayName || u.username}</Text>
                      {u.phone ? <Text style={{ fontSize: fontSize.sm + "px", color: textColor.assist }}>{u.phone}</Text> : null}
                      {selected ? <Text style={{ marginLeft: spacing.sm + "px", color: brandColor, fontSize: fontSize.lg + "px" }}>✓</Text> : null}
                    </View>
                  );
                })
              )}
            </ScrollView>
            <Button
              loading={submitting}
              disabled={assigneeId === null}
              onClick={handleAssign}
              style={{ marginTop: spacing.md + "px", backgroundColor: brandColor, color: "#fff", fontSize: fontSize.lg + "px", fontWeight: 600, borderRadius: radius.lg + "px", opacity: assigneeId === null ? 0.5 : 1 }}
            >
              确认派单
            </Button>
          </View>
        </View>
      ) : null}

      {/* 闭环弹层（填写处置备注） */}
      {closing ? (
        <View style={{ position: "fixed", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setClosing(null)}>
          <View style={{ width: "100%", backgroundColor: "#fff", borderTopLeftRadius: radius.lg + "px", borderTopRightRadius: radius.lg + "px", padding: spacing.xl + "px " + spacing.lg + "px " + spacing.xl + "px" }} onClick={(e) => e.stopPropagation()}>
            <Text style={{ display: "block", fontSize: fontSize.lg + "px", fontWeight: 700, color: textColor.main }}>闭环 · #{closing.id}</Text>
            <Text style={{ display: "block", marginTop: spacing.xs + "px", fontSize: fontSize.sm + "px", color: textColor.secondary }}>
              {closing.deviceName}{closing.assignee ? " · 处理人 " + closing.assignee : ""}
            </Text>
            <Textarea
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
              placeholder="填写处置备注（可选）"
              style={{ width: "100%", height: "88px", marginTop: spacing.md + "px", backgroundColor: bgColor, borderRadius: radius.md + "px", padding: spacing.md + "px", fontSize: fontSize.md + "px", boxSizing: "border-box" }}
            />
            <Button
              loading={submitting}
              onClick={handleClose}
              style={{ marginTop: spacing.md + "px", backgroundColor: brandColor, color: "#fff", fontSize: fontSize.lg + "px", fontWeight: 600, borderRadius: radius.lg + "px" }}
            >
              确认闭环
            </Button>
          </View>
        </View>
      ) : null}
    </View>
  );
}
