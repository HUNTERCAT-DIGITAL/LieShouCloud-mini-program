/**
 * 登录页（端自身骨架 · 登录态来自 core-web useAuthStore）
 * 租户 + 账号 + 密码 → core-web login（POST /api/auth/login）。
 * UI 对齐 mobile-ui 规范：设计令牌 + 品牌 hero。
 */
import { useState } from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../../config/editions';
import {
  bgColor,
  borderColor,
  brandColor,
  cardColor,
  fontSize,
  radius,
  spacing,
  statusColor,
  textColor,
} from '../../styles/tokens';

const inputStyle = {
  height: '88rpx',
  padding: `0 ${spacing.md}rpx`,
  marginBottom: `${spacing.md}rpx`,
  borderRadius: `${radius.md}rpx`,
  border: `1rpx solid ${borderColor}`,
  backgroundColor: cardColor,
  fontSize: `${fontSize.md}rpx`,
  color: textColor.main,
} as const;

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
    <View
      style={{
        minHeight: '100vh',
        backgroundColor: bgColor,
        padding: `${spacing.xxl}rpx ${spacing.xl}rpx`,
      }}
    >
      {/* 品牌 hero */}
      <View style={{ textAlign: 'center', padding: `${spacing.xl}rpx 0 ${spacing.xxl}rpx` }}>
        <Text
          style={{
            display: 'block',
            fontSize: '56rpx',
            fontWeight: 700,
            color: brandColor,
          }}
        >
          {edition.brandName}
        </Text>
        {edition.slogan ? (
          <Text
            style={{
              display: 'block',
              marginTop: `${spacing.sm}rpx`,
              fontSize: `${fontSize.sm}rpx`,
              color: textColor.secondary,
            }}
          >
            {edition.slogan}
          </Text>
        ) : null}
      </View>

      {/* 表单 */}
      <View>
        <Input
          style={inputStyle}
          value={tenantCode}
          placeholder="租户编码"
          placeholderStyle={`color: ${textColor.assist}`}
          onInput={(e) => setTenantCode(e.detail.value)}
        />
        <Input
          style={inputStyle}
          value={username}
          placeholder="用户名"
          placeholderStyle={`color: ${textColor.assist}`}
          onInput={(e) => setUsername(e.detail.value)}
        />
        <Input
          style={inputStyle}
          password
          value={password}
          placeholder="密码"
          placeholderStyle={`color: ${textColor.assist}`}
          onInput={(e) => setPassword(e.detail.value)}
        />
        {error ? (
          <Text style={{ display: 'block', marginBottom: `${spacing.sm}rpx`, fontSize: `${fontSize.sm}rpx`, color: statusColor.error }}>
            {error}
          </Text>
        ) : null}
        <Button
          loading={submitting}
          onClick={handleLogin}
          style={{
            marginTop: `${spacing.sm}rpx`,
            backgroundColor: brandColor,
            color: '#fff',
            fontSize: `${fontSize.lg}rpx`,
            fontWeight: 600,
            borderRadius: `${radius.lg}rpx`,
          }}
        >
          登 录
        </Button>
      </View>
    </View>
  );
}
