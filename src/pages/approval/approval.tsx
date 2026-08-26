/**
 * 小程序审批中心（ADR-0032 · 多端接入）.
 * 三个 Tab（待我审批/我发起的/全部）+ 发起审批 + 通过/驳回/撤销。
 */
import { Button, Input, Picker, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";

import { EmptyState, StatusBadge } from "../../components/MiniUI";
import {
  APPROVAL_STATUS_META,
  APPROVAL_TYPE_META,
  approveApproval,
  cancelApproval,
  createApproval,
  getApprovalCounts,
  listApprovals,
  rejectApproval,
  type ApprovalRequest,
  type ApprovalType,
} from "../../services/approval";
import { useAuthStore } from "../../stores/auth";
import { listUsers, type UserOption } from "../../services/user";
import { colors } from "../../theme/colors";

type TabKey = "inbox" | "mine" | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "inbox", label: "待我审批" },
  { key: "mine", label: "我发起的" },
  { key: "all", label: "全部" },
];

export default function Approval() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.userId;

  const [tab, setTab] = useState<TabKey>("inbox");
  const [rows, setRows] = useState<ApprovalRequest[]>([]);
  const [counts, setCounts] = useState({ inbox: 0, mine: 0 });
  const [createOpen, setCreateOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<ApprovalRequest | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [approvers, setApprovers] = useState<UserOption[]>([]);

  // 发起表单
  const [type, setType] = useState<ApprovalType>("EXPENSE");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [detail, setDetail] = useState("");
  const [approverId, setApproverId] = useState("");

  const load = async () => {
    try {
      const [list, c] = await Promise.all([listApprovals({ role: tab }), getApprovalCounts()]);
      setRows(list);
      setCounts(c);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    void load();
    // 阶段 2 · 审批人下拉（ADR-0032）：租户用户列表
    void listUsers()
      .then(setApprovers)
      .catch(() => setApprovers([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const submitCreate = async () => {
    const id = Number(approverId);
    if (!title.trim()) {
      Taro.showToast({ title: "请输入标题", icon: "none" });
      return;
    }
    if (!Number.isInteger(id) || id <= 0) {
      Taro.showToast({ title: "请填写审批人 ID", icon: "none" });
      return;
    }
    try {
      await createApproval({
        type,
        title: title.trim(),
        amount: amount ? Number(amount) : undefined,
        detail: detail.trim() ? detail.trim() : undefined,
        approverId: id,
      });
      Taro.showToast({ title: "已发起审批", icon: "success" });
      setCreateOpen(false);
      setTitle("");
      setAmount("");
      setDetail("");
      setApproverId("");
      setType("EXPENSE");
      void load();
    } catch (e) {
      Taro.showToast({ title: String(e), icon: "none" });
    }
  };

  const onApprove = (row: ApprovalRequest) => {
    Taro.showModal({
      title: `通过审批 #${row.id}`,
      content: row.title,
      confirmText: "通过",
      cancelText: "取消",
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await approveApproval(row.id);
          Taro.showToast({ title: "已通过", icon: "success" });
          void load();
        } catch (e) {
          Taro.showToast({ title: String(e), icon: "none" });
        }
      },
    });
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    if (!rejectComment.trim()) {
      Taro.showToast({ title: "请填写驳回意见", icon: "none" });
      return;
    }
    try {
      await rejectApproval(rejectTarget.id, rejectComment.trim());
      Taro.showToast({ title: "已驳回", icon: "success" });
      setRejectTarget(null);
      setRejectComment("");
      void load();
    } catch (e) {
      Taro.showToast({ title: String(e), icon: "none" });
    }
  };

  const onCancel = (row: ApprovalRequest) => {
    Taro.showModal({
      title: "撤销审批",
      content: `确定撤销「${row.title}」？`,
      confirmText: "撤销",
      cancelText: "取消",
      confirmColor: "#f5222d",
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await cancelApproval(row.id);
          Taro.showToast({ title: "已撤销", icon: "success" });
          void load();
        } catch (e) {
          Taro.showToast({ title: String(e), icon: "none" });
        }
      },
    });
  };

  const fmtAmount = (v: number | null | undefined) =>
    v !== null && v !== undefined ? `¥ ${Number(v).toFixed(2)}` : "";

  return (
    <View style={{ minHeight: "100vh", padding: "24rpx", backgroundColor: colors.bg }}>
      {/* Tab 切换 */}
      <View style={{ display: "flex", flexDirection: "row", marginBottom: "24rpx" }}>
        {TABS.map((t) => (
          <View
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "16rpx 0",
              borderRadius: "8rpx",
              background: tab === t.key ? colors.primary : "#fff",
              color: tab === t.key ? "#fff" : colors.textSecondary,
              border: "1rpx solid " + (tab === t.key ? colors.primary : "#e8e8e8"),
              fontSize: "26rpx",
              fontWeight: 600,
            }}
          >
            {t.label}
            {t.key === "inbox" && counts.inbox > 0 ? ` (${counts.inbox})` : ""}
          </View>
        ))}
      </View>

      <Button
        onClick={() => setCreateOpen(true)}
        style={{ backgroundColor: colors.primary, color: "#fff", borderRadius: "8rpx", marginBottom: "24rpx" }}
      >
        发起审批
      </Button>

      {rows.length === 0 ? (
        <EmptyState message="暂无审批请求" />
      ) : (
        rows.map((row) => {
          const isApprover = userId !== undefined && row.approverId === userId;
          const isRequester = userId !== undefined && row.requesterId === userId;
          return (
            <View
              key={row.id}
              style={{
                backgroundColor: "#fff",
                padding: "24rpx",
                borderRadius: "12rpx",
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
                  marginBottom: "8rpx",
                }}
              >
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12rpx" }}>
                  <StatusBadge {...APPROVAL_TYPE_META[row.type]} />
                  <Text style={{ fontSize: "28rpx", fontWeight: 600, color: colors.text }}>{row.title}</Text>
                </View>
                <StatusBadge {...APPROVAL_STATUS_META[row.status]} />
              </View>
              <View style={{ fontSize: "22rpx", color: colors.textSecondary }}>
                <Text>
                  #{row.id} · 发起人 {row.requesterId} · 审批人 {row.approverId}
                </Text>
              </View>
              {row.amount !== null && row.amount !== undefined && (
                <Text style={{ fontSize: "30rpx", fontWeight: 700, color: colors.primary }}>
                  {fmtAmount(row.amount)}
                </Text>
              )}
              {row.detail ? (
                <Text style={{ fontSize: "22rpx", color: colors.textSecondary, display: "block", marginTop: "8rpx" }}>
                  {row.detail}
                </Text>
              ) : null}
              <View
                style={{
                  fontSize: "22rpx",
                  color: colors.textSecondary,
                  marginTop: "8rpx",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>{new Date(row.createdAt).toLocaleString("zh-CN")}</Text>
                {row.comment ? <Text>意见：{row.comment}</Text> : null}
              </View>

              {row.status === "PENDING" && (
                <View style={{ display: "flex", flexDirection: "row", gap: "16rpx", marginTop: "16rpx" }}>
                  {isApprover && (
                    <>
                      <Button
                        size="mini"
                        onClick={() => onApprove(row)}
                        style={{ flex: 1, background: "#52c41a", color: "#fff" }}
                      >
                        通过
                      </Button>
                      <Button
                        size="mini"
                        onClick={() => {
                          setRejectComment("");
                          setRejectTarget(row);
                        }}
                        style={{ flex: 1, background: "#f5222d", color: "#fff" }}
                      >
                        驳回
                      </Button>
                    </>
                  )}
                  {isRequester && (
                    <Button
                      size="mini"
                      onClick={() => onCancel(row)}
                      style={{ flex: 1, background: "#fafafa", color: colors.textSecondary }}
                    >
                      撤销
                    </Button>
                  )}
                  {!isApprover && !isRequester && (
                    <Text style={{ fontSize: "24rpx", color: colors.textSecondary }}>无权操作</Text>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}

      {/* 发起审批 Modal */}
      {createOpen && (
        <View style={modalStyle}>
          <View style={{ backgroundColor: "#fff", borderRadius: "12rpx", padding: "32rpx" }}>
            <Text style={{ fontSize: "32rpx", fontWeight: 700, marginBottom: "16rpx" }}>发起审批</Text>
            <Text style={{ fontSize: "24rpx", color: colors.text, marginBottom: "8rpx" }}>类型</Text>
            <View style={{ display: "flex", flexDirection: "row", gap: "12rpx", marginBottom: "16rpx" }}>
              {(Object.keys(APPROVAL_TYPE_META) as ApprovalType[]).map((t) => (
                <Button
                  key={t}
                  size="mini"
                  onClick={() => setType(t)}
                  style={{
                    flex: 1,
                    background: type === t ? APPROVAL_TYPE_META[t].color : "#fff",
                    color: type === t ? "#fff" : colors.textSecondary,
                  }}
                >
                  {APPROVAL_TYPE_META[t].text}
                </Button>
              ))}
            </View>
            <Input
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
              placeholder="标题（如：报销 8 月差旅费）"
              placeholderStyle={`color: ${colors.textSecondary};`}
              style={inputStyle}
            />
            <Input
              value={amount}
              onInput={(e) => setAmount(e.detail.value)}
              type="digit"
              placeholder="金额（元，选填）"
              placeholderStyle={`color: ${colors.textSecondary};`}
              style={inputStyle}
            />
            <Input
              value={detail}
              onInput={(e) => setDetail(e.detail.value)}
              placeholder="详情（选填）"
              placeholderStyle={`color: ${colors.textSecondary};`}
              style={inputStyle}
            />
            <Text style={{ fontSize: "24rpx", color: colors.text, marginBottom: "8rpx" }}>审批人</Text>
            <Picker
              mode="selector"
              range={approvers.map((u) => `${u.displayName || u.username} (#${u.id})`)}
              onChange={(e) => {
                const idx = Number(e.detail.value);
                const u = approvers[idx];
                if (u) setApproverId(String(u.id));
              }}
            >
              <View
                style={{
                  ...inputStyle,
                  color: approverId ? colors.text : colors.textSecondary,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {approverId
                  ? (approvers.find((u) => String(u.id) === approverId)?.displayName ?? approverId)
                  : "选择审批人（租户用户）"}
              </View>
            </Picker>
            <Button onClick={() => void submitCreate()} style={{ backgroundColor: colors.primary, color: "#fff" }}>
              提交
            </Button>
            <Button
              onClick={() => setCreateOpen(false)}
              style={{ background: "#fafafa", color: colors.textSecondary, marginTop: "16rpx" }}
            >
              取消
            </Button>
          </View>
        </View>
      )}

      {/* 驳回意见 Modal */}
      {rejectTarget && (
        <View style={modalStyle}>
          <View style={{ backgroundColor: "#fff", borderRadius: "12rpx", padding: "32rpx" }}>
            <Text style={{ fontSize: "32rpx", fontWeight: 700, marginBottom: "16rpx" }}>
              驳回审批 #{rejectTarget.id}
            </Text>
            <Text style={{ fontSize: "26rpx", color: colors.text, marginBottom: "16rpx", display: "block" }}>
              {rejectTarget.title}
            </Text>
            <Input
              value={rejectComment}
              onInput={(e) => setRejectComment(e.detail.value)}
              placeholder="必填：说明驳回原因"
              placeholderStyle={`color: ${colors.textSecondary};`}
              style={inputStyle}
            />
            <Button onClick={() => void submitReject()} style={{ backgroundColor: "#f5222d", color: "#fff" }}>
              驳回
            </Button>
            <Button
              onClick={() => setRejectTarget(null)}
              style={{ background: "#fafafa", color: colors.textSecondary, marginTop: "16rpx" }}
            >
              取消
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "48rpx",
  zIndex: 100,
} as const;

const inputStyle = {
  border: "1rpx solid #d9d9d9",
  borderRadius: "8rpx",
  padding: "16rpx",
  fontSize: "30rpx",
  marginBottom: "24rpx",
} as const;
