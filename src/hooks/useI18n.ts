/**
 * Taro 小程序 i18n 绑定（@lieshoucloud/i18n · 2026-09）.
 *
 * useSyncExternalStore 订阅语言变化 → 组件自动重渲染；
 * 持久化用 Taro.setStorageSync（小程序无 localStorage）。
 */
import { useSyncExternalStore } from "react";
import Taro from "@tarojs/taro";
import {
  getLocale,
  onLocaleChange,
  setLocale as i18nSetLocale,
  t as i18nT,
  type Locale,
  type TranslationKey,
  type TranslationParams,
} from "@lieshoucloud/i18n";

const LOCALE_KEY = "lsc_locale";

export function useLocale(): Locale {
  return useSyncExternalStore(onLocaleChange, getLocale, getLocale);
}

export function useI18n(): {
  locale: Locale;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  setLocale: (l: Locale) => void;
} {
  const locale = useLocale();
  return {
    locale,
    t: (key, params) => i18nT(key, params),
    setLocale: (l) => {
      i18nSetLocale(l);
      Taro.setStorageSync(LOCALE_KEY, l);
    },
  };
}

/** 恢复上次选择语言（app.tsx 启动时调一次） */
export function restoreLocale(): void {
  const saved = Taro.getStorageSync(LOCALE_KEY) as string;
  if (saved === "zh-CN" || saved === "en-US") i18nSetLocale(saved);
}
