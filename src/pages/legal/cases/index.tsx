/**
 * 法务版案件列表（律师工作台 · industry-legal）.
 * 状态：OPEN 受理中 / IN_PROGRESS 进行中 / CLOSED 已结案.
 */
import { Text, View } from "@tarojs/components";
import { useEffect, useState } from "react";

import { EmptyState } from "../../../components/MiniUI";
import { legalApi } from "../../../services/industryLegal";
import type { CasePriority, CaseStatus, LegalCase } from "@lieshoucloud/industry-legal";
import { colors } from "../../../theme/colors";

const STATUS_META: Record<CaseStatus, { text: string; color: string }> = {
  OPEN: { text: "受理中", color: "#1677ff" },
  IN_PROGRESS: { text: "进行中", color: "#faad14" },
  CLOSED: { text: "已结案", color: "#999" },
};

const PRIORITY_META: Record<CasePriority, { text: string; color: string }> = {
  LOW: { text: "低", color: "#52c41a" },
  MEDIUM: { text: "中", color: "#faad14" },
  HIGH: { text: "高", color: "#f5222d" },
  URGENT: { text: "紧急", color: "#f5222d" },
};

export default function LegalCases() {
  const [data, setData] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setData(await legalApi.listCases({}));
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
        <EmptyState message="暂无案件" />
      ) : (
        data.map((c) => (
          <View
            key={c.id}
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
              <Text style={{ fontSize: "28rpx", fontWeight: 600, color: colors.text }}>{c.title}</Text>
              <Text style={{ fontSize: "24rpx", color: STATUS_META[c.status].color }}>
                {STATUS_META[c.status].text}
              </Text>
            </View>
            <Text style={{ fontSize: "22rpx", color: colors.textSecondary, marginTop: "8rpx" }}>
              {c.caseNo} · {PRIORITY_META[c.priority].text}优先级
              {c.clientName ? ` · ${c.clientName}` : ""}
            </Text>
            {c.assignedLawyer && (
              <Text style={{ fontSize: "22rpx", color: colors.textSecondary, marginTop: "4rpx" }}>
                承办律师：{c.assignedLawyer}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}
