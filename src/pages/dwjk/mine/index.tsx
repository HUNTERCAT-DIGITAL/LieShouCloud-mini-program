/**
 * 我的页（客户仓 deploy:prepare 生成 · 勿手改/勿提交）.
 * 规范：docs/mini-program-architecture.md §5.6 —— 账号卡 + 功能列表 + 退出登录。
 */
import { Button, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useAuthStore } from "@lieshoucloud/core-web";

import ListCell from "@/components/ListCell";
import { getEdition } from "@/config/editions";
import { APP_VERSION } from "@/config/version";
import { bgColor, borderColor, brandColor, fontSize, radius, spacing, statusColor, textColor } from "@/styles/tokens";

export default function DwjkMine() {
  const user = useAuthStore((s) => s.user);
  const edition = getEdition();

  return (
    <View style={{ minHeight: "100vh", backgroundColor: bgColor, padding: spacing.md + "px" }}>
      {/* 账号卡 */}
      <View style={{ backgroundColor: "#fff", borderRadius: radius.lg + "px", padding: spacing.lg + "px", marginBottom: spacing.md + "px", display: "flex", alignItems: "center" }}>
        <View style={{ width: "56px", height: "56px", borderRadius: "28px", backgroundColor: brandColor, display: "flex", alignItems: "center", justifyContent: "center", marginRight: spacing.md + "px", flexShrink: 0 }}>
          <Text style={{ color: "#fff", fontSize: fontSize.xl + "px", fontWeight: 700 }}>{(user?.username || "U").slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ display: "block", fontSize: fontSize.lg + "px", fontWeight: 700, color: textColor.main }} numberOfLines={1}>
            {user?.username || "未登录"}
          </Text>
          <Text style={{ display: "block", marginTop: spacing.xxs + "px", fontSize: fontSize.sm + "px", color: textColor.secondary }} numberOfLines={1}>
            {user?.tenantName || "电网监控 · 值班员"}
          </Text>
        </View>
      </View>

      {/* 功能列表 */}
      <View style={{ backgroundColor: "#fff", borderRadius: radius.lg + "px", overflow: "hidden", border: "1px solid " + borderColor, marginBottom: spacing.lg + "px" }}>
        <ListCell
          icon="ℹ️"
          title="关于"
          description={"平台 " + edition.brandName + " · 版别 " + edition.id + " · v" + APP_VERSION}
        />
        <ListCell
          icon="🔔"
          title="告警订阅"
          description="微信服务通知 · 告警主动推送"
          onClick={() => Taro.navigateTo({ url: "/pages/dwjk/notify-subscribe/index" })}
        />
      </View>

      {/* 退出登录 */}
      <Button
        onClick={() => {
          useAuthStore.getState().logout();
          Taro.reLaunch({ url: "/pages/login/login" });
        }}
        style={{ backgroundColor: "#fff", color: statusColor.error, fontSize: fontSize.md + "px", fontWeight: 600, borderRadius: radius.lg + "px", border: "1px solid " + borderColor }}
      >
        退出登录
      </Button>
    </View>
  );
}
