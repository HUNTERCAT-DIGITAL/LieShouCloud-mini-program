/**
 * 门户页（欢迎页 · 客户启动页 EXTRA_HOME · deploy:prepare 生成 · 勿手改/勿提交）.
 * 产品介绍 + 功能亮点，未登录可浏览；点「进入系统」→ 登录（已登录直达值班台）。
 */
import { Button, Image, Text, View } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { useAuthStore } from "@lieshoucloud/core-web";
import { getEdition } from "@/config/editions";
import { APP_VERSION } from "@/config/version";

import logo from "@/assets/logo.png";
import { bgColor, borderColor, fontSize, radius, spacing, textColor } from "@/styles/tokens";

const FEATURES = [
  { icon: "📡", title: "设备实时监控", desc: "在线/离线/温度一目了然，异常优先置顶" },
  { icon: "🔔", title: "告警主动推送", desc: "订阅微信服务通知，告警到达第一时间知晓" },
  { icon: "📈", title: "遥测趋势曲线", desc: "节点温度时序曲线，研判设备健康走势" },
  { icon: "🎫", title: "运维工单闭环", desc: "告警转工单，处置过程可追踪" },
];

export default function DwjkPortal() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const edition = getEdition();

  // 已登录：直达值班台（登录页成功后 reLaunch 到本页，这里再跳）
  useDidShow(() => {
    if (isAuthenticated) Taro.reLaunch({ url: "/pages/dwjk/workspace/index" });
  });

  function handleEnter() {
    if (isAuthenticated) {
      Taro.reLaunch({ url: "/pages/dwjk/workspace/index" });
    } else {
      Taro.navigateTo({ url: "/pages/login/login" });
    }
  }

  return (
    <View style={{ minHeight: "100vh", backgroundColor: bgColor }}>
      {/* 品牌区（撞色渐变 + logo） */}
      <View style={{ backgroundImage: "linear-gradient(160deg, #02429b 0%, #0a6bd8 60%, #f5f6f7 60.1%)", padding: "64px 32px 0", paddingBottom: "0px" }}>
        <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Image src={logo} style={{ width: "88px", height: "88px", borderRadius: "18px", backgroundColor: "#fff" }} />
          <Text style={{ display: "block", marginTop: spacing.md + "px", color: "#fff", fontSize: "30px", fontWeight: 700, lineHeight: 1.3 }}>{edition.brandName}</Text>
          <Text style={{ display: "block", marginTop: spacing.xs + "px", color: "rgba(255,255,255,0.85)", fontSize: fontSize.md + "px" }}>{edition.slogan || "变电站 · 配电设备在线监测"}</Text>
        </View>
      </View>

      {/* 功能亮点 */}
      <View style={{ padding: spacing.lg + "px " + spacing.md + "px", display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
        {FEATURES.map((f) => (
          <View key={f.title} style={{ width: "48%", marginBottom: spacing.sm + "px", backgroundColor: "#fff", borderRadius: radius.lg + "px", border: "1px solid " + borderColor, padding: spacing.md + "px" }}>
            <Text style={{ fontSize: fontSize.xl + "px" }}>{f.icon}</Text>
            <Text style={{ display: "block", marginTop: spacing.sm + "px", fontSize: fontSize.md + "px", fontWeight: 700, color: textColor.main }}>{f.title}</Text>
            <Text style={{ display: "block", marginTop: spacing.xs + "px", fontSize: fontSize.xs + "px", color: textColor.secondary, lineHeight: 1.5 }}>{f.desc}</Text>
          </View>
        ))}
      </View>

      {/* 进入 */}
      <View style={{ padding: "0 " + spacing.md + "px " + spacing.xl + "px" }}>
        <Button
          onClick={handleEnter}
          style={{ backgroundColor: "#02429b", color: "#fff", fontSize: fontSize.lg + "px", fontWeight: 600, borderRadius: radius.lg + "px" }}
        >
          {isAuthenticated ? "进入值班台" : "进入系统"}
        </Button>
        <Text style={{ display: "block", marginTop: spacing.md + "px", textAlign: "center", fontSize: fontSize.xs + "px", color: textColor.assist }}>
          物联网云平台 · 电网监控 v{APP_VERSION}
        </Text>
      </View>
    </View>
  );
}
