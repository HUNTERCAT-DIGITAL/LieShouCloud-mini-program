/**
 * 告警订阅设置页（客户仓 deploy:prepare 生成 · 勿手改/勿提交）.
 * L1 特有：微信服务通知订阅（wx.requestSubscribeMessage）——告警主动推送。
 * ⚠️ 模板 ID 需从小程序后台（mp.weixin.qq.com → 订阅消息）申请，配置到 TMPL_IDS。
 */
import { Button, Text, View } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { useAuthStore } from "@lieshoucloud/core-web";
import { useState } from "react";

import StatusBadge from "@/components/StatusBadge";
import { bgColor, borderColor, brandColor, fontSize, radius, spacing, textColor } from "@/styles/tokens";

/** 订阅消息模板 ID（从小程序后台申请后填入；未配置时订阅按钮不可用） */
const TMPL_IDS: string[] = [];

const SUB_KEY = "dwjk:notify:subscribe";

interface SubState {
  accept: boolean;
  at: string;
}

function loadState(): SubState | null {
  try {
    const raw = Taro.getStorageSync(SUB_KEY);
    if (raw && typeof raw === "object") return raw as SubState;
  } catch {
    /* ignore */
  }
  return null;
}

export default function NotifySubscribePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [state, setState] = useState<SubState | null>(loadState());
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useDidShow(() => {
    if (!isAuthenticated) Taro.reLaunch({ url: "/pages/login/login" });
  });

  async function handleSubscribe() {
    if (TMPL_IDS.length === 0) {
      setMsg("订阅模板未配置（需在微信公众平台申请订阅消息模板，配置到 TMPL_IDS）");
      return;
    }
    setSubmitting(true);
    setMsg("");
    try {
      // Taro 类型缺陷：tmplIds/entityIds 均标必填（实际 weapp 只要 tmplIds）→ 断言绕过
      const res = (await Taro.requestSubscribeMessage({ tmplIds: TMPL_IDS } as never)) as Record<string, string>;
      const first = res[TMPL_IDS[0]];
      const accept = first === "accept";
      const next: SubState = { accept, at: new Date().toISOString() };
      Taro.setStorageSync(SUB_KEY, next);
      setState(next);
      setMsg(accept ? "订阅成功：告警将推送到微信服务通知" : "已拒绝订阅，可随时重新开启");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "订阅失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ minHeight: "100vh", backgroundColor: bgColor, padding: spacing.md + "px" }}>
      {/* 说明卡 */}
      <View style={{ backgroundColor: "#fff", borderRadius: radius.lg + "px", border: "1px solid " + borderColor, padding: spacing.lg + "px", marginBottom: spacing.md + "px" }}>
        <Text style={{ display: "block", fontSize: fontSize.lg + "px", fontWeight: 700, color: textColor.main }}>告警订阅</Text>
        <Text style={{ display: "block", marginTop: spacing.sm + "px", fontSize: fontSize.md + "px", color: textColor.secondary, lineHeight: 1.6 }}>
          订阅后，设备触发告警（温度越限、离线等）将通过微信服务通知主动推送，不用打开小程序也能第一时间知晓。
        </Text>
        <Text style={{ display: "block", marginTop: spacing.sm + "px", fontSize: fontSize.sm + "px", color: textColor.assist, lineHeight: 1.6 }}>
          说明：微信订阅消息为一次性订阅（每次授权限次），推送使用完后需重新订阅。
        </Text>
      </View>

      {/* 状态 */}
      <View style={{ backgroundColor: "#fff", borderRadius: radius.lg + "px", border: "1px solid " + borderColor, padding: spacing.lg + "px", marginBottom: spacing.md + "px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: fontSize.md + "px", color: textColor.main, fontWeight: 600 }}>当前状态</Text>
        {state ? (
          <StatusBadge status={state.accept ? "success" : "offline"} text={state.accept ? "已订阅" : "未订阅"} />
        ) : (
          <StatusBadge status="offline" text="未订阅" />
        )}
      </View>

      {msg ? (
        <Text style={{ display: "block", marginBottom: spacing.md + "px", fontSize: fontSize.sm + "px", color: msg.includes("成功") ? "#52c41a" : "#f5222d" }}>
          {msg}
        </Text>
      ) : null}

      <Button
        loading={submitting}
        onClick={handleSubscribe}
        style={{ backgroundColor: brandColor, color: "#fff", fontSize: fontSize.lg + "px", fontWeight: 600, borderRadius: radius.lg + "px" }}
      >
        {state?.accept ? "重新订阅" : "开启告警订阅"}
      </Button>
    </View>
  );
}
