/**
 * 教育版孩子进度（家长 · industry-edu）.
 * 展示各课程已上/剩余课时进度条.
 */
import { Text, View } from "@tarojs/components";
import { useEffect, useState } from "react";

import { EmptyState } from "../../../components/MiniUI";
import { eduApi } from "../../../services/industryEdu";
import type { ChildProgress } from "@lieshoucloud/industry-edu";
import { colors } from "../../../theme/colors";

export default function EduChildren() {
  const [data, setData] = useState<ChildProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // 演示期固定 childId=1；后端接入后按当前家长的孩子列表遍历
      setData(await eduApi.listChildProgress(1));
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

  const total = (p: ChildProgress) => p.completedLessons + p.remainingLessons;
  const pct = (p: ChildProgress) => (total(p) === 0 ? 0 : Math.round((p.completedLessons / total(p)) * 100));

  return (
    <View style={{ minHeight: "100vh", padding: "24rpx", backgroundColor: colors.bg }}>
      {data.length === 0 && !loading ? (
        <EmptyState message="暂无孩子进度数据" />
      ) : (
        data.map((p, i) => (
          <View
            key={`${p.childId}-${p.courseId}-${i}`}
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
                marginBottom: "12rpx",
              }}
            >
              <Text style={{ fontSize: "28rpx", fontWeight: 600, color: colors.text }}>
                课程 #{p.courseId}
              </Text>
              <Text style={{ fontSize: "24rpx", color: colors.textSecondary }}>
                {p.completedLessons}/{total(p)} 课时 · {pct(p)}%
              </Text>
            </View>
            <View
              style={{
                height: "12rpx",
                backgroundColor: "#f0f0f0",
                borderRadius: "6rpx",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${pct(p)}%`,
                  height: "100%",
                  backgroundColor: colors.primary,
                  borderRadius: "6rpx",
                }}
              />
            </View>
          </View>
        ))
      )}
    </View>
  );
}
