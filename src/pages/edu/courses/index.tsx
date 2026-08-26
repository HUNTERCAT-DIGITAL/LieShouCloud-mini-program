/**
 * 教育版课程列表（学生/家长 · industry-edu）.
 */
import { Text, View } from "@tarojs/components";
import { useEffect, useState } from "react";

import { EmptyState } from "../../../components/MiniUI";
import { eduApi } from "../../../services/industryEdu";
import type { Course } from "@lieshoucloud/industry-edu";
import { colors } from "../../../theme/colors";

export default function EduCourses() {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setData(await eduApi.listCourses({}));
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
      <View style={{ marginBottom: "24rpx" }}>
        <Text style={{ fontSize: "32rpx", fontWeight: 600, color: colors.text }}>全部课程</Text>
      </View>
      {data.length === 0 && !loading ? (
        <EmptyState message="暂无课程" />
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
              <Text style={{ fontSize: "30rpx", fontWeight: 600, color: colors.text }}>{c.name}</Text>
              <Text style={{ fontSize: "24rpx", color: colors.primary }}>
                {c.lessonCount ? `${c.lessonCount} 课时` : ""}
              </Text>
            </View>
            {(c.ageGroup || c.classMode) && (
              <Text style={{ fontSize: "24rpx", color: colors.textSecondary, marginTop: "8rpx" }}>
                {[c.ageGroup, c.classMode].filter(Boolean).join(" · ")}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}
