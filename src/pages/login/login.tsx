/**
 * 登录页（端自身骨架 · 登录态来自 core-web useAuthStore）
 * 租户 + 账号 + 密码 → core-web login（POST /api/auth/login）。
 */
import { useState } from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../../config/editions';

export default function LoginPage() {
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const [tenantCode, setTenantCode] = useState(edition.tenantCode ?? 'default');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useDidShow(() => {
    if (edition.login?.required === false || isAuthenticated) {
      Taro.reLaunch({ url: '/pages/home/home' });
    }
  });

  async function handleLogin(): Promise<void> {
    if (!username.trim() || !password) {
      setError('请输入账号和密码');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await login(username.trim(), password, tenantCode.trim() || undefined);
      Taro.reLaunch({ url: '/pages/home/home' });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="login-page">
      <View className="login-brand">
        <Text className="login-title">{edition.brandName}</Text>
        {edition.slogan && <Text className="login-slogan">{edition.slogan}</Text>}
      </View>
      <View className="login-form">
        <Input
          className="login-input"
          value={tenantCode}
          placeholder="租户编码"
          onInput={(e) => setTenantCode(e.detail.value)}
        />
        <Input
          className="login-input"
          value={username}
          placeholder="用户名"
          onInput={(e) => setUsername(e.detail.value)}
        />
        <Input
          className="login-input"
          password
          value={password}
          placeholder="密码"
          onInput={(e) => setPassword(e.detail.value)}
        />
        {error && <Text className="login-error">{error}</Text>}
        <Button className="login-btn" loading={submitting} onClick={handleLogin}>
          登 录
        </Button>
      </View>
    </View>
  );
}
