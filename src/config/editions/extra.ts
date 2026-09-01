/**
 * 电网监控客户页面注册（客户仓 deploy:prepare 生成 · 勿手改/勿提交）.
 */
export const EXTRA_HOME: string | null = 'pages/dwjk/portal/index';

export const EXTRA_PAGES: string[] = ['pages/dwjk/portal/index', 'pages/dwjk/workspace/index', 'pages/dwjk/alerts/index', 'pages/dwjk/devices/index', 'pages/dwjk/device-detail/index', 'pages/dwjk/notify-subscribe/index', 'pages/dwjk/ops/index', 'pages/dwjk/mine/index'];

// 客户 API 网关（weapp 请求域名，必须 HTTPS + 小程序后台白名单）
export const CUSTOM_API_BASE: string | null = 'https://dev.dwjk.lieshou.huntercat.cn';
