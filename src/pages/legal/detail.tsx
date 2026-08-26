/**
 * 小程序案件详情 + 办案时间线（ADR-0036/0045 · legal 能力域）.
 */
import { ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useState } from "react";

import { EmptyState, StatusBadge } from "../../components/MiniUI";
import {
  CASE_STATUS_META,
  CASE_TYPE_META,
  EVENT_TYPE_META,
  getCase,
  isLegalApiError,
  listCaseEvents,
  type CaseEvent,
  type LegalCase,
} from "../../services/legal";
import { colors } from "../../theme/colors";

export default function LegalCaseDetail() {
  const [detail, setDetail] = useState<LegalCase | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useLoad((params) => {
    const cid = Number(params?.id);
    if (!Number.isFinite(cid)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    Promise.all([getCase(cid), listCaseEvents(cid)])
      .then(([c, evs]) => {
        setDetail(c);
        setEvents(evs);
      })
      .catch((e: unknown) => {
        if (isLegalApiError(e) && e.status === 404) setNotFound(true);
        else setLoadError(true);
      })
      .finally(() => setLoading(false));
  });

  const back = () => Taro.navigateBack();

  if (loading) {
    return (
      <View style={{ padding: "48rpx", textAlign: "center", color: colors.textSecondary }}>
        加载中…
      </View>
    );
  }

  if (notFound || !detail) {
    return (
      <View style={{ padding: "48rpx" }}>
        <EmptyState message="案件不存在或不属于当前租户" />
        <Text style={{ color: colors.primary, textAlign: "center", marginTop: "24rpx" }} onClick={back}>
          返回列表
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={{ padding: "48rpx" }}>
        <EmptyState message="加载失败，请检查网络后重试" />
        <Text style={{ color: colors.primary, textAlign: "center", marginTop: "24rpx" }} onClick={back}>
          返回列表
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ minHeight: "100vh", backgroundColor: colors.bg }}>
      <View style={{ padding: "24rpx" }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: "32rpx", fontWeight: 700, color: colors.text, flex: 1 }}>
            {detail.caseNo}
          </Text>
          <StatusBadge {...CASE_STATUS_META[detail.status]} />
        </View>
        <Text style={{ fontSize: "26rpx", color: colors.textSecondary, marginTop: "8rpx" }}>
          {detail.title}
        </Text>

        <View style={cardStyle}>
          <InfoRow label="案件类型" value={CASE_TYPE_META[detail.caseType] ?? detail.caseType} />
          <InfoRow label="承办律师" value={detail.responsibleLawyer ?? "-"} />
          <InfoRow label="我方当事人" value={detail.party ?? "-"} />
          <InfoRow label="对方当事人" value={detail.oppositeParty ?? "-"} />
          <InfoRow label="受理法院" value={detail.court ?? "-"} />
          <InfoRow
            label="标的额"
            value={typeof detail.amount === "number" ? `¥${detail.amount.toLocaleString()}` : "-"}
          />
          <InfoRow label="立案日期" value={detail.filedAt ?? "-"} />
          <InfoRow label="结案日期" value={detail.closedAt ?? "-"} />
        </View>

        <Text style={{ fontSize: "28rpx", fontWeight: 600, marginBottom: "16rpx", color: colors.text }}>
          办案时间线（{events.length}）
        </Text>
        {events.length === 0 ? (
          <EmptyState message="暂无时间线事件" />
        ) : (
          <View style={cardStyle}>
            {events.map((e, idx) => (
              <View
                key={e.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  padding: "16rpx 0",
                  borderTop: idx > 0 ? "1rpx solid #f0f0f0" : "none",
                }}
              >
                <View
                  style={{
                    width: "16rpx",
                    height: "16rpx",
                    borderRadius: "8rpx",
                    backgroundColor: EVENT_TYPE_META[e.eventType].color,
                    marginTop: "12rpx",
                    marginRight: "16rpx",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: "22rpx", fontWeight: 600, color: EVENT_TYPE_META[e.eventType].color }}>
                      {EVENT_TYPE_META[e.eventType].text}
                    </Text>
                    <Text style={{ fontSize: "20rpx", color: colors.textSecondary }}>
                      {new Date(e.occurredAt).toLocaleString("zh-CN", { hour12: false })}
                    </Text>
                  </View>
                  <Text style={{ fontSize: "26rpx", fontWeight: 500, color: colors.text, marginTop: "4rpx" }}>
                    {e.title}
                  </Text>
                  {e.detail ? (
                    <Text style={{ fontSize: "22rpx", color: colors.textSecondary, marginTop: "4rpx" }}>
                      {e.detail}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ display: "flex", flexDirection: "row", padding: "8rpx 0" }}>
      <Text style={{ width: "160rpx", fontSize: "24rpx", color: colors.textSecondary }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: "24rpx", color: colors.text }}>{value}</Text>
    </View>
  );
}

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "12rpx",
  padding: "24rpx",
  marginBottom: "32rpx",
  border: "1rpx solid #eee",
};
