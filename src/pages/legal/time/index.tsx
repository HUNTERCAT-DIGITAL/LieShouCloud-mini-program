/**
 * 法务版计时记录（律师/助理 · industry-legal）.
 */
import { Text, View } from "@tarojs/components";
import { useEffect, useState } from "react";

import { EmptyState } from "../../../components/MiniUI";
import { legalApi } from "../../../services/industryLegal";
import type { TimeEntry } from "@lieshoucloud/industry-legal";
import { colors } from "../../../theme/colors";

export default function LegalTime() {
  const [data, setData] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setData(await legalApi.listTimeEntries({}));
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
        <EmptyState message="暂无计时记录" />
      ) : (
        data.map((t) => (
          <View
            key={t.id}
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
              <Text style={{ fontSize: "28rpx", fontWeight: 600, color: colors.text }}>
                案件 #{t.caseId}
              </Text>
              <Text style={{ fontSize: "24rpx", color: colors.primary }}>
                {t.durationMinutes} 分钟
              </Text>
            </View>
            <Text style={{ fontSize: "22rpx", color: colors.textSecondary, marginTop: "8rpx" }}>
              {t.billedAt.slice(0, 16).replace("T", " ")}
              {t.note ? ` · ${t.note}` : ""}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
