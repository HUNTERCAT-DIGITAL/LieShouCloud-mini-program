/**
 * 客户仓 deploy:prepare 生成（勿手改/勿提交）· 独立仓库为空实现。
 *
 * 客户注入点：
 *  - EXTRA_HOME：客户启动页（对外内容页/品牌首页），优先于默认登录页
 *  - EXTRA_PAGES：客户专属页面路径（追加进 pages 清单）
 *  - EXTRA_TABBAR：客户底部导航（原生 tabBar 配置）
 */
export const EXTRA_HOME: string | null = null;

export const EXTRA_PAGES: string[] = [];

export const EXTRA_TABBAR: unknown = undefined;
