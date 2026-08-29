/**
 * 电网监控客户页面注册（客户仓 deploy:prepare 生成 · 勿手改/勿提交）.
 */
export const EXTRA_HOME: string | null = 'pages/dwjk/workspace/index';

export const EXTRA_PAGES: string[] = ['pages/dwjk/workspace/index', 'pages/dwjk/ops/index'];

// 客户 API 网关（weapp 请求域名，必须 HTTPS + 小程序后台白名单）
export const CUSTOM_API_BASE: string | null = 'https://dev.dwjk.lieshou.huntercat.cn';
