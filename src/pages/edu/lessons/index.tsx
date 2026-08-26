/**
 * 教育版课时列表（全角色 · industry-edu）.
 * 状态：SCHEDULED 待上课 / IN_PROGRESS 进行中 / COMPLETED 已完成 / CANCELLED 已取消.
 */
import { Text, View } from "@tarojs/components";
import { useEffect, useState } from "react";

import { EmptyState } from "../../../components/MiniUI";
import { eduApi } from "../../../services/industryEdu";
import type { Lesson, LessonStatus } from "@lieshoucloud/industry-edu";
import { colors } from "../../../theme/colors";

const STATUS_META: Record<LessonStatus, { text: string; color: string }> = {
  SCHEDULED: { text: "待上课", color: "#1677ff" },
  IN_PROGRESS: { text: "进行中", color: "#faad14" },
  COMPLETED: { text: "已完成", color: "#52c41a" },
  CANCELLED: { text: "已取消", color: "#999" },
};

export default function EduLessons() {
  const [data, setData] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setData(await eduApi.listLessons({}));
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
        <EmptyState message="暂无课时" />
      ) : (
        data.map((l) => (
          <View
            key={l.id}
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
                {l.scheduledAt.slice(0, 16).replace("T", " ")}
              </Text>
              <Text style={{ fontSize: "24rpx", color: STATUS_META[l.status].color }}>
                {STATUS_META[l.status].text}
              </Text>
            </View>
            <Text style={{ fontSize: "24rpx", color: colors.textSecondary, marginTop: "8rpx" }}>
              时长 {l.durationMinutes} 分钟
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
