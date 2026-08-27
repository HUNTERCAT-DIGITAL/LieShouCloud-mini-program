/**
 * 小程序登录页（Phase 9 · 多端真实化）.
 *
 * Taro 组件：View / Text / Input / Button 都是编译时跨平台映射。
 * 跨页面导航用 Taro.navigateTo / redirectTo。
 */
import { Button, Input, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";

import { isApiError } from "../../services/auth";
import { useAuthStore } from "../../stores/auth";
import { colors } from "../../theme/colors";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!username || !password) {
      Taro.showToast({ title: "请输入用户名和密码", icon: "none" });
      return;
    }
    setSubmitting(true);
    try {
      await login(username, password);
      Taro.reLaunch({ url: "/pages/workbench/workbench" });
    } catch (e) {
      const msg = isApiError(e) ? e.message : String(e);
      Taro.showToast({ title: `登录失败: ${msg}`, icon: "none" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={{
        minHeight: "100vh",
        padding: "64rpx 48rpx",
        backgroundColor: colors.bg,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "48rpx",
          marginBottom: "64rpx",
        }}
      >
        <View
          style={{
            width: "20rpx",
            height: "20rpx",
            borderRadius: "50%",
            backgroundColor: colors.primary,
            marginRight: "16rpx",
          }}
        />
        <Text style={{ fontSize: "32rpx", fontWeight: 600 }}>LieShou Cloud</Text>
      </View>

      <Text style={{ fontSize: "56rpx", fontWeight: 700, color: colors.primary, marginBottom: "8rpx" }}>
        登录 · Mini
      </Text>
      <Text style={{ fontSize: "32rpx", fontWeight: 600, color: colors.text, marginBottom: "16rpx" }}>
        佳佳好漂亮 ✨
      </Text>
      <Text style={{ fontSize: "24rpx", color: colors.textSecondary, marginBottom: "64rpx" }}>
        与 Admin / Desktop / Mobile 共享后端
      </Text>

      <View style={{ marginBottom: "32rpx" }}>
        <Text style={{ fontSize: "28rpx", color: colors.text, marginBottom: "12rpx" }}>用户名</Text>
        <Input
          value={username}
          onInput={(e) => setUsername(e.detail.value)}
          placeholder="futurewl"
          placeholderStyle={`color: ${colors.textSecondary};`}
          style={{
            border: "1rpx solid #d9d9d9",
            borderRadius: "8rpx",
            padding: "20rpx 24rpx",
            fontSize: "30rpx",
            backgroundColor: "#fff",
          }}
        />
      </View>
      <View style={{ marginBottom: "32rpx" }}>
        <Text style={{ fontSize: "28rpx", color: colors.text, marginBottom: "12rpx" }}>密码</Text>
        <Input
          value={password}
          onInput={(e) => setPassword(e.detail.value)}
          placeholder="password"
          placeholderStyle={`color: ${colors.textSecondary};`}
          password
          style={{
            border: "1rpx solid #d9d9d9",
            borderRadius: "8rpx",
            padding: "20rpx 24rpx",
            fontSize: "30rpx",
            backgroundColor: "#fff",
          }}
        />
      </View>

      <Button
        onClick={onSubmit}
        loading={submitting}
        disabled={submitting}
        style={{
          backgroundColor: colors.primary,
          color: "#fff",
          borderRadius: "8rpx",
          fontSize: "32rpx",
          fontWeight: 600,
          marginTop: "24rpx",
        }}
      >
        登录
      </Button>
    </View>
  );
}
