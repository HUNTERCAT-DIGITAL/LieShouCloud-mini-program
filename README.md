# @lieshoucloud/mini-program

LieShou Cloud 微信小程序 —— **Taro 4 + React + 微信小程序** 最小骨架。

## 启动

前置：Node 22 + pnpm 9+ + 微信开发者工具（[下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)）。

```bash
# 仓库根 - 装所有 workspace
pnpm install

# 仅 mini-program
pnpm turbo run dev:weapp --filter=@lieshoucloud/mini-program
# 或
cd apps/mini-program && pnpm dev:weapp
# → 输出到 dist/ 目录, 微信开发者工具打开该目录

# H5 预览（设计师）
pnpm turbo run dev:h5 --filter=@lieshoucloud/mini-program
# 或
cd apps/mini-program && pnpm dev:h5
# → http://localhost:10086
```

### 微信开发者工具接入

1. 打开微信开发者工具
2. 选「导入项目」→ 选 `apps/mini-program/` 目录
3. `project.config.json` 已配 `miniprogramRoot: "dist/"`
4. 首次可使用「测试号」（无需 appid）

## 路由（Taro 4 · 文件式）

```
src/pages/
├── index/
│   ├── index.tsx     首页
│   └── index.config.ts
└── health/
    ├── health.tsx    HealthBadge 演示
    └── health.config.ts
```

## API 网关配置

小程序 `fetch` 必须 HTTPS + 域名白名单（微信公众平台 → 开发管理 → 服务器域名），
所以 API 网关地址在**构建期**注入，`src/services/api.ts` 解析优先级：

1. `TARO_APP_API_BASE` 环境变量（Taro 约定 `TARO_APP_*` 编译期注入）
2. h5 开发（`TARO_ENV=h5`）→ 空串，走同源反代（vite / nginx `/api` → gateway）
3. weapp 默认 → `https://dev.lieshoucloud.huntercat.cn`（现有公网 dev 栈，
   nginx `/api/*` → gateway，见 `deploy/bt-panel-nginx/`）

```bash
# 覆盖默认网关（如对接 staging / prod）
TARO_APP_API_BASE=https://api.example.com pnpm dev:weapp
```

入口 `app.tsx` 加载时自动调用 `configureApiBaseUrl()`，所有经
`@lieshoucloud/api-client` 的请求（auth / customer / inventory / finance）都会拼绝对地址。

## 跨包共享

| 包                         | mini-program 用法                                         |
| -------------------------- | --------------------------------------------------------- |
| `@lieshoucloud/types`      | `import type { HealthStatus } from '@lieshoucloud/types'` |
| `@lieshoucloud/api-client` | `import { request } from '@lieshoucloud/api-client'`      |
| `@lieshoucloud/ui`         | **不复用**（React 19 vs 18.3 + Taro 编译产物 ≠ DOM）      |

`config/index.ts` 的 `compilerOptions.alias` 与 `tsconfig.json` 的 `paths` 必须**完全同步**。

## 技术栈

- Taro 4.0（编译器 + 运行时 + React 适配）
- React 18.3.1
- 编译目标：**weapp**（主）+ h5（可选）
- TypeScript 5.6

## Phase 2+ 路线

- NutUI / antd-mobile-taro 集成
- E2E 测试（miniprogram-ci 或）
- Taro UI 组件库
- taro-redux / zustand 状态管理
- 真实 API 接入（✅ Phase 9：login + customer + inventory + finance 已接；网关地址构建期配置化见上文）
- 自定义 tabBar / 分包加载
- 微信支付 / 分享 / 订阅消息

## 已知限制

- Phase 1 不 `taro build` CI —— 本地手动 `pnpm dev:weapp`
- 小程序 `fetch` 受 CORS 限制，Phase 5+ 后端配允许
- Taro 4 暂不支持 React 19（与 mobile 共享 React 18.3）
- 第三方 UI 库未引入；Phase 2+ 视需要集成

## 关联文档

- `.ai/decisions/0014-mini-program.md`
- `.ai/conversations/2026-08-22-mini-program.md`
- ADR-0012（monorepo）
- ADR-0013（mobile）
