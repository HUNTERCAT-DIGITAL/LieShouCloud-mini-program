/**
 * 小程序客户列表（Phase 9 · 多端真实化）.
 */
import { Input, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";

import { EmptyState, StatusBadge } from "../../components/MiniUI";
import { listCustomers, STATUS_META, type Customer } from "../../services/customer";
import { colors } from "../../theme/colors";

export default function CustomersList() {
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listCustomers(keyword || undefined);
      setData(list);
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

  const onSearch = () => void load();

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
          onConfirm={onSearch}
          placeholder="按关键字搜索"
          placeholderStyle={`color: ${colors.textSecondary};`}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            border: "1rpx solid #d9d9d9",
            borderRadius: "8rpx",
            padding: "16rpx 24rpx",
            fontSize: "28rpx",
            marginRight: "16rpx",
          }}
        />
        <View
          onClick={onSearch}
          style={{
            backgroundColor: colors.primary,
            color: "#fff",
            padding: "16rpx 32rpx",
            borderRadius: "8rpx",
            fontSize: "28rpx",
          }}
        >
          <Text style={{ color: "#fff" }}>搜索</Text>
        </View>
      </View>

      {loading ? (
        <Text style={{ textAlign: "center", color: colors.textSecondary, padding: "64rpx 0" }}>加载中...</Text>
      ) : data.length === 0 ? (
        <EmptyState message="暂无客户" />
      ) : (
        data.map((c) => (
          <View
            key={c.id}
            style={{
              backgroundColor: "#fff",
              padding: "24rpx",
              borderRadius: "12rpx",
              marginBottom: "16rpx",
              border: "1rpx solid #eee",
            }}
            onClick={() => Taro.navigateTo({ url: `/pages/customers/detail?id=${c.id}` })}
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
              <Text style={{ fontSize: "32rpx", fontWeight: 600, color: colors.text, flex: 1 }}>{c.name}</Text>
              <StatusBadge {...STATUS_META[c.status]} />
            </View>
            <Text style={{ fontSize: "24rpx", color: colors.textSecondary }}>
              {c.contactName ?? "—"} · {c.contactPhone ?? "—"}
            </Text>
            <Text style={{ fontSize: "20rpx", color: colors.textSecondary, marginTop: "4rpx" }}>{c.createdAt}</Text>
          </View>
        ))
      )}
    </View>
  );
}
