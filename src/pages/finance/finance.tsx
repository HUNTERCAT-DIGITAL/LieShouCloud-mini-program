/**
 * 小程序记账本页（Phase 9 · 多端接入）.
 */
import { Button, Input, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";

import { EmptyState, StatusBadge } from "../../components/MiniUI";
import {
  createLedger,
  getSummary,
  LEDGER_CATEGORIES,
  LEDGER_TYPE_META,
  listLedger,
  type LedgerEntry,
  type LedgerSummary,
  type LedgerType,
} from "../../services/finance";
import { colors } from "../../theme/colors";

import "./finance.css";

export default function Finance() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<LedgerSummary>({ income: 0, expense: 0, balance: 0, count: 0 });
  const [createOpen, setCreateOpen] = useState(false);
  const [type, setType] = useState<LedgerType>("INCOME");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("销售收入");

  const load = async () => {
    try {
      const [list, s] = await Promise.all([listLedger(), getSummary()]);
      setEntries(list);
      setSummary(s);
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      Taro.showToast({ title: "请输入有效金额", icon: "none" });
      return;
    }
    try {
      await createLedger({ type, amount: n, category, occurredAt: new Date().toISOString().slice(0, 10) });
      Taro.showToast({ title: "已记一笔", icon: "success" });
      setCreateOpen(false);
      setAmount("");
      void load();
    } catch (e) {
      Taro.showToast({ title: String(e), icon: "none" });
    }
  };

  const fmt = (v: number) => `¥ ${Number(v).toFixed(2)}`;

  return (
    <View style={{ minHeight: "100vh", padding: "24rpx", backgroundColor: colors.bg }}>
      {/* 汇总 */}
      <View style={{ display: "flex", flexDirection: "row", gap: "16rpx", marginBottom: "24rpx" }}>
        <SumCard label="收入" value={summary.income} color={colors.success} />
        <SumCard label="支出" value={summary.expense} color="#f5222d" />
        <SumCard label="结余" value={summary.balance} color={summary.balance >= 0 ? colors.primary : "#f5222d"} />
      </View>

      <Button
        onClick={() => setCreateOpen(true)}
        style={{ backgroundColor: colors.primary, color: "#fff", borderRadius: "8rpx", marginBottom: "24rpx" }}
      >
        记一笔
      </Button>

      {entries.length === 0 ? (
        <EmptyState message="暂无记账记录" />
      ) : (
        entries.map((e) => (
          <View
            key={e.id}
            style={{
              backgroundColor: "#fff",
              padding: "24rpx",
              borderRadius: "12rpx",
              marginBottom: "16rpx",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1rpx solid #eee",
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4rpx",
                }}
              >
                <Text style={{ fontSize: "30rpx", fontWeight: 600, color: colors.text }}>{e.category ?? "未分类"}</Text>
                <StatusBadge {...LEDGER_TYPE_META[e.type]} />
              </View>
              <Text style={{ fontSize: "22rpx", color: colors.textSecondary }}>{e.occurredAt}</Text>
            </View>
            <Text
              style={{ fontSize: "32rpx", fontWeight: 700, color: e.type === "INCOME" ? colors.success : "#f5222d" }}
            >
              {e.type === "INCOME" ? "+" : "-"}
              {fmt(e.amount)}
            </Text>
          </View>
        ))
      )}

      {/* 记一笔 Modal */}
      {createOpen && (
        <View style={modalStyle}>
          <View style={{ backgroundColor: "#fff", borderRadius: "12rpx", padding: "32rpx" }}>
            <Text style={{ fontSize: "32rpx", fontWeight: 700, marginBottom: "16rpx" }}>记一笔</Text>
            <View style={{ display: "flex", flexDirection: "row", gap: "16rpx", marginBottom: "16rpx" }}>
              {(Object.keys(LEDGER_TYPE_META) as LedgerType[]).map((t) => (
                <Button
                  key={t}
                  size="mini"
                  onClick={() => setType(t)}
                  style={{
                    flex: 1,
                    background: type === t ? LEDGER_TYPE_META[t].color : "#fff",
                    color: type === t ? "#fff" : colors.textSecondary,
                  }}
                >
                  {LEDGER_TYPE_META[t].text}
                </Button>
              ))}
            </View>
            <Input
              value={amount}
              onInput={(e) => setAmount(e.detail.value)}
              type="digit"
              placeholder="金额（元）"
              placeholderStyle={`color: ${colors.textSecondary};`}
              style={inputStyle}
            />
            <Text style={{ fontSize: "24rpx", color: colors.text, marginBottom: "8rpx" }}>分类</Text>
            <View
              style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "12rpx", marginBottom: "24rpx" }}
            >
              {LEDGER_CATEGORIES.map((c) => (
                <Text
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    fontSize: "24rpx",
                    padding: "8rpx 16rpx",
                    borderRadius: "6rpx",
                    border: "1rpx solid " + (category === c ? colors.primary : "#d9d9d9"),
                    color: category === c ? colors.primary : colors.textSecondary,
                    background: category === c ? "#e6f4ff" : "#fff",
                  }}
                >
                  {c}
                </Text>
              ))}
            </View>
            <Button onClick={() => void submit()} style={{ backgroundColor: colors.primary, color: "#fff" }}>
              保存
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
    </View>
  );
}

function SumCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: "12rpx",
        padding: "24rpx",
        borderTop: "6rpx solid " + color,
        borderLeft: "1rpx solid #eee",
        borderRight: "1rpx solid #eee",
        borderBottom: "1rpx solid #eee",
      }}
    >
      <Text style={{ fontSize: "22rpx", color: colors.textSecondary, marginBottom: "8rpx" }}>{label}</Text>
      <Text style={{ fontSize: "32rpx", fontWeight: 700, color }}>{`¥ ${Number(value).toFixed(2)}`}</Text>
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
