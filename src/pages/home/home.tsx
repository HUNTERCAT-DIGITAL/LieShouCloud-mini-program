/**
 * 启动页（端自身骨架 · 用户/登录态来自 core-web useAuthStore）
 * 品牌 + 平台标识 + 版本 + 登录用户 + 后端连通性检查（GET /api/auth/me）。
 * UI 对齐 mobile-ui 规范：设计令牌 + 基元组件（tokens/components）。
 */
import { useEffect, useState } from 'react';
import { Button, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useAuthStore } from '@lieshoucloud/core-web';

import HealthBanner from '../../components/HealthBanner';
import { getEdition } from '../../config/editions';
import { APP_VERSION } from '../../config/version';
import {
  bgColor,
  borderColor,
  brandColor,
  cardColor,
  fontSize,
  radius,
  spacing,
  textColor,
} from '../../styles/tokens';

export default function HomePage() {
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useDidShow(() => {
    const required = edition.login?.required !== false;
    if (required && !isAuthenticated) Taro.reLaunch({ url: '/pages/login/login' });
  });

  useEffect(() => {
    fetchMe().catch(() => {
      /* 静默：守卫已兜底 */
    });
  }, [fetchMe]);

  async function runCheck(): Promise<void> {
    setChecking(true);
    setCheckMsg(null);
    try {
      const me = await fetchMe();
      setCheckMsg({
        ok: true,
        text: `后端连通正常（${me.username ?? '已登录'} @ ${me.tenantCode ?? '-'}）`,
      });
    } catch (err) {
      setCheckMsg({ ok: false, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setChecking(false);
    }
  }

  function handleLogout(): void {
    logout();
    Taro.reLaunch({ url: '/pages/login/login' });
  }

  const infoRows = [
    { key: '平台', value: '微信小程序 · Taro 4 + React' },
    { key: '版本', value: APP_VERSION },
    { key: '版别', value: edition.id },
    {
      key: '用户',
      value: `${user?.username || '未登录'}${user?.tenantName ? `（${user.tenantName}）` : ''}`,
    },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: bgColor, padding: `${spacing.md}px` }}>
      {/* 品牌 hero */}
      <View style={{ textAlign: 'center', padding: `${spacing.xl}px 0 ${spacing.lg}px` }}>
        <Text
          style={{
            display: 'block',
            fontSize: `${fontSize.xxl}px`,
            fontWeight: 700,
            color: brandColor,
          }}
        >
          {edition.brandName}
        </Text>
        <Text
          style={{
            display: 'block',
            marginTop: `${spacing.xs}px`,
            fontSize: `${fontSize.sm}px`,
            color: textColor.secondary,
          }}
        >
          {edition.slogan}
        </Text>
      </View>

      {/* 信息卡 */}
      <View
        style={{
          backgroundColor: cardColor,
          borderRadius: `${radius.lg}px`,
          padding: `0 ${spacing.md}px`,
          marginBottom: `${spacing.md}px`,
        }}
      >
        {infoRows.map((row, i) => (
          <View
            key={row.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: `${spacing.sm}px 0`,
              borderBottom: i < infoRows.length - 1 ? `0px solid ${borderColor}` : 'none',
            }}
          >
            <Text style={{ fontSize: `${fontSize.md}px`, color: textColor.secondary }}>{row.key}</Text>
            <Text style={{ fontSize: `${fontSize.md}px`, color: textColor.main, fontWeight: 600 }}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      {/* 连通性检查 */}
      {checkMsg && (
        <View style={{ marginBottom: `${spacing.md}px` }}>
          <HealthBanner
            status={checkMsg.ok ? 'success' : 'error'}
            title={checkMsg.ok ? '后端连通正常' : '后端连通失败'}
            subtitle={checkMsg.text}
          />
        </View>
      )}

      {/* 操作 */}
      <Button
        loading={checking}
        onClick={runCheck}
        style={{
          backgroundColor: brandColor,
          color: '#fff',
          fontSize: `${fontSize.md}px`,
          fontWeight: 600,
          borderRadius: `${radius.lg}px`,
          marginBottom: `${spacing.sm}px`,
        }}
      >
        检查后端连通性
      </Button>
      <Button
        onClick={handleLogout}
        style={{
          backgroundColor: cardColor,
          color: textColor.secondary,
          fontSize: `${fontSize.md}px`,
          borderRadius: `${radius.lg}px`,
        }}
      >
        退出登录
      </Button>
    </View>
  );
}
