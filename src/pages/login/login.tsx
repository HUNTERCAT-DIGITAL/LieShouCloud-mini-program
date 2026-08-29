/**
 * 小程序登录页（Phase 9 · 多端真实化）.
 *
 * Taro 组件：View / Text / Input / Button 都是编译时跨平台映射。
 * 跨页面导航用 Taro.navigateTo / redirectTo。
 */
import { Button, Input, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";

import { getEdition } from "../../config/editions";
import { isApiError } from "../../services/auth";
import { useAuthStore } from "../../stores/auth";
import { useI18n } from "../../hooks/useI18n";
import { colors } from "../../theme/colors";

import "./login.css";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const { locale, setLocale, t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 端薄壳化(2026-08-29): login.required=false 游客直达(跳过登录, 直接进首页/客户首页)
  useEffect(() => {
    const edition = getEdition();
    if (edition.login?.required === false) {
      Taro.reLaunch({ url: edition.homePath ?? "/pages/workbench/workbench" });
    }
  }, []);

  const onSubmit = async () => {
    if (!username || !password) {
      Taro.showToast({ title: t("common.login.empty"), icon: "none" });
      return;
    }
    setSubmitting(true);
    try {
      await login(username, password);
      Taro.reLaunch({ url: "/pages/workbench/workbench" });
    } catch (e) {
      const msg = isApiError(e) ? e.message : String(e);
      Taro.showToast({ title: `${t("common.login.failed")}: ${msg}`, icon: "none" });
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
          justifyContent: "space-between",
          marginTop: "48rpx",
          marginBottom: "64rpx",
        }}
      >
        <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
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
        {/* 语言切换 */}
        <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Text
            onClick={() => setLocale("zh-CN")}
            style={{
              fontSize: "26rpx",
              padding: "4rpx 16rpx",
              borderRadius: "999rpx",
              backgroundColor: locale === "zh-CN" ? colors.primary : "transparent",
              color: locale === "zh-CN" ? "#fff" : colors.textSecondary,
            }}
          >
            中文
          </Text>
          <Text
            onClick={() => setLocale("en-US")}
            style={{
              fontSize: "26rpx",
              marginLeft: "8rpx",
              padding: "4rpx 16rpx",
              borderRadius: "999rpx",
              backgroundColor: locale === "en-US" ? colors.primary : "transparent",
              color: locale === "en-US" ? "#fff" : colors.textSecondary,
            }}
          >
            EN
          </Text>
        </View>
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
        <Text style={{ fontSize: "28rpx", color: colors.text, marginBottom: "12rpx" }}>{t("common.login.username")}</Text>
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
        <Text style={{ fontSize: "28rpx", color: colors.text, marginBottom: "12rpx" }}>{t("common.login.password")}</Text>
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
        {t("common.login.submit")}
      </Button>
    </View>
  );
}
