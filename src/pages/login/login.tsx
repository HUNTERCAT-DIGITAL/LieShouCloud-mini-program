/**
 * 登录页（端自身骨架 · 登录态来自 core-web useAuthStore）
 * 账号 + 密码 → core-web login（POST /api/auth/login）。
 * 单租户（hideTenantInput）：隐藏租户输入框，默认租户静默使用 edition.tenantCode ?? 'default'。
 * 背景撞色对齐 mobile-web H5 登录页：上蓝（品牌白字）→ 下灰（表单白卡）。
 */
import { useState } from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../../config/editions';
import { EXTRA_HOME } from '../../config/editions/extra';
import { brandColor, cardColor, fontSize, radius, spacing, statusColor, textColor } from '../../styles/tokens';

const inputStyle = {
  height: '44px',
  padding: `0 ${spacing.md}px`,
  marginBottom: `${spacing.md}px`,
  borderRadius: `${radius.md}px`,
  border: '1px solid #e5e5e5',
  backgroundColor: cardColor,
  fontSize: `${fontSize.md}px`,
  color: textColor.main,
} as const;

export default function LoginPage() {
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  // 单租户版：隐藏租户输入框，默认租户静默使用（对齐 mobile-web H5）
  const hideTenantInput = edition.login?.hideTenantInput === true;
  const [tenantCode] = useState(edition.tenantCode ?? 'default');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useDidShow(() => {
    // 客户启动页（EXTRA_HOME）存在时，登录成功/免登回客户首页；否则骨架 home
    // ⚠️ reLaunch 需要绝对路由（前导 /）；EXTRA_HOME 在 pages 数组里是不带 / 的，这里补上
    const home = EXTRA_HOME ? `/${EXTRA_HOME.replace(/^\//, '')}` : '/pages/home/home';
    if (edition.login?.required === false || isAuthenticated) {
      Taro.reLaunch({ url: home });
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
      Taro.reLaunch({ url: EXTRA_HOME ? `/${EXTRA_HOME.replace(/^\//, '')}` : '/pages/home/home' });
    } catch (err) {
      // 防御：错误可能是对象（后端 message 嵌套）→ 提取可读文本，避免显示 [object Object]
      const raw = err instanceof Error ? err.message : err;
      setError(typeof raw === 'string' && raw && raw !== '[object Object]' ? raw : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View
      style={{
        minHeight: '100vh',
        // 撞色：上 60% 品牌蓝（白字品牌）→ 下 40% 页面灰（白卡表单）· 对齐 H5 登录页
        backgroundImage: 'linear-gradient(160deg, #02429b 0%, #0a6bd8 60%, #f5f6f7 60.1%)',
        padding: '64px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 品牌区（蓝色区 · 白字） */}
      <View style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Text style={{ display: 'block', color: '#fff', fontSize: '28px', fontWeight: 700, lineHeight: 1.4 }}>
          {edition.brandName}
        </Text>
        {edition.slogan ? (
          <Text style={{ display: 'block', marginTop: `${spacing.sm}px`, color: 'rgba(255,255,255,0.85)', fontSize: `${fontSize.sm}px` }}>
            {edition.slogan}
          </Text>
        ) : null}
      </View>

      {/* 表单卡（灰色区 · 白卡） */}
      <View
        style={{
          width: '100%',
          backgroundColor: cardColor,
          borderRadius: `${radius.lg}px`,
          padding: `${spacing.xl}px`,
        }}
      >
        {/* 单租户（hideTenantInput）：租户输入框隐藏，默认租户静默使用 edition.tenantCode ?? 'default' */}
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
          <Text style={{ display: 'block', marginBottom: `${spacing.sm}px`, fontSize: `${fontSize.sm}px`, color: statusColor.error }}>
            {error}
          </Text>
        ) : null}
        <Button
          loading={submitting}
          onClick={handleLogin}
          style={{
            marginTop: `${spacing.sm}px`,
            backgroundColor: brandColor,
            color: '#fff',
            fontSize: `${fontSize.lg}px`,
            fontWeight: 600,
            borderRadius: `${radius.lg}px`,
          }}
        >
          登 录
        </Button>
      </View>
    </View>
  );
}
