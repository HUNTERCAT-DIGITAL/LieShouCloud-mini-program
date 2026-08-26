/**
 * 小程序案件列表（ADR-0036/0045 · legal 能力域）.
 */
import { Input, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";

import { EmptyState, StatusBadge } from "../../components/MiniUI";
import { CASE_STATUS_META, listCases, type LegalCase } from "../../services/legal";
import { colors } from "../../theme/colors";

export default function LegalCasesList() {
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const page = await listCases({ keyword: keyword || undefined }, 1, 100);
      setData(page.items);
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
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: "24rpx",
        }}
      >
        <Input
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onConfirm={() => void load()}
          placeholder="按案号/标题/当事人搜索"
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: "12rpx",
            padding: "16rpx 24rpx",
            fontSize: "26rpx",
          }}
        />
      </View>

      {data.length === 0 && !loading ? (
        <EmptyState message="暂无案件" />
      ) : (
        data.map((c) => (
          <View
            key={c.id}
            onClick={() => Taro.navigateTo({ url: `/pages/legal/detail?id=${c.id}` })}
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
              <Text style={{ fontSize: "28rpx", fontWeight: 600, color: colors.text, flex: 1 }}>
                {c.title}
              </Text>
              <StatusBadge {...CASE_STATUS_META[c.status]} />
            </View>
            <Text style={{ fontSize: "24rpx", color: colors.textSecondary, marginTop: "8rpx" }}>
              {c.caseNo}
            </Text>
            <Text style={{ fontSize: "22rpx", color: colors.textSecondary, marginTop: "4rpx" }}>
              {c.party ?? "—"} vs {c.oppositeParty ?? "—"} · {c.responsibleLawyer ?? "—"}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
