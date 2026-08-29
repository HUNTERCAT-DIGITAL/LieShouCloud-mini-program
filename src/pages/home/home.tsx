/**
 * 启动页（端自身骨架）· 品牌 + 平台标识 + 版本 + 登录用户 + 后端连通性检查。
 * 未登录（含登出）→ 回登录页；后续业务页面从零装配，本页是端能力验证锚点。
 */
import { useEffect, useState } from 'react';
import { Button, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';

import { getEdition } from '../../config/editions';
import { APP_VERSION } from '../../config/version';
import { fetchMe, getUser, isLoggedIn, logout, type SessionUser } from '../../lib/auth';
import './home.css';

export default function HomePage() {
  const edition = getEdition();
  const [user, setUser] = useState<SessionUser | null>(() => getUser());
  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useDidShow(() => {
    if (!isLoggedIn()) Taro.reLaunch({ url: '/pages/login/login' });
  });

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => {
        /* 静默：守卫已兜底 */
      });
  }, []);

  async function runCheck(): Promise<void> {
    setChecking(true);
    setCheckMsg(null);
    try {
      const me = await fetchMe();
      setUser(me);
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

  return (
    <View className="home-page">
      <View className="home-hero">
        <Text className="home-title">{edition.brandName}</Text>
        <Text className="home-slogan">{edition.slogan}</Text>
      </View>
      <View className="home-card">
        <View className="home-row">
          <Text className="home-key">平台</Text>
          <Text className="home-value">微信小程序 · Taro 4 + React</Text>
        </View>
        <View className="home-row">
          <Text className="home-key">版本</Text>
          <Text className="home-value">{APP_VERSION}</Text>
        </View>
        <View className="home-row">
          <Text className="home-key">版别</Text>
          <Text className="home-value">{edition.id}</Text>
        </View>
        <View className="home-row">
          <Text className="home-key">用户</Text>
          <Text className="home-value">
            {user?.displayName || user?.username || '未登录'}
            {user?.tenantName ? `（${user.tenantName}）` : ''}
          </Text>
        </View>
      </View>
      <View className="home-actions">
        <Button className="btn-primary" loading={checking} onClick={runCheck}>
          检查后端连通性
        </Button>
        {checkMsg && (
          <Text className={checkMsg.ok ? 'check-ok' : 'check-fail'}>{checkMsg.text}</Text>
        )}
        <Button className="btn-ghost" onClick={handleLogout}>
          退出登录
        </Button>
      </View>
    </View>
  );
}
