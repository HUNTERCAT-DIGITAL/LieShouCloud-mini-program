/**
 * Taro 主配置 (weapp / h5 共用).
 *
 * monorepo 适配:
 *  - alias 必须与 tsconfig.json paths 完全一致
 *  - pnpm 软链下, Taro 4.x 用 symlinks 解析 workspace 包,
 *    webpack5-runner 会自动追踪 alias 路径
 *
 * @see .ai/decisions/0014-mini-program.md
 */
import { resolve } from "path";

const projectRoot = resolve(__dirname, "..");
const monorepoRoot = projectRoot; // 独立仓库：根即 monorepo 根（open/ submodule）

const alias = {
  "@": resolve(projectRoot, "src"),
  "@lieshoucloud/contract-api": resolve(monorepoRoot, "open/contract-api/src"),
  "@lieshoucloud/contract-types": resolve(monorepoRoot, "open/contract-types/src"),
  "@lieshoucloud/core-web": resolve(monorepoRoot, "open/core-web/src"),
};

export default {
  projectName: "lieshoucloud-mini-program",
  date: "2026-1-22",
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1,
    414: 1.81 / 2,
  },
  sourceRoot: "src",
  outputRoot: "dist",
  plugins: [
    "@tarojs/plugin-framework-react",
    // weapp 是主目标; 如需 h5 编译, 在 command line 用 --type h5
    // Taro 会自动加载对应平台插件; 此处省略
  ],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: "react",
  compilerOptions: {
    alias,
  },
  cache: { enable: false },
  // monorepo: workspace 共享包（api-client / types）main 指向 TS 源码，
  // 不在 sourceDir 内 —— 必须显式加进 babel-loader 的 include（Taro 官方 monorepo 机制）。
  // 否则 webpack 报 ModuleParseError: no loaders configured for .ts
  mini: {
    compile: {
      include: [
        resolve(monorepoRoot, "open/contract-api/src"),
        resolve(monorepoRoot, "open/contract-types/src"),
        resolve(monorepoRoot, "open/contract-config/src"),
        resolve(monorepoRoot, "open/core-web/src"),
      ],
    },
  },
  // H5 配置（按需启用 --type h5）
  h5: {
    publicPath: "/",
    staticDirectory: "static",
    output: { filename: "js/[name].[hash:8].js" },
    miniCssExtractPluginOption: { ignoreOrder: true, filename: "css/[name].[hash].css" },
    postcss: {
      autoprefixer: { enable: true },
      pxtransform: { enable: true, config: {} },
      cssModules: {
        enable: true,
        config: { namingPattern: "module", generateScopedName: "[name]__[local]___[hash:base64:5]" },
      },
    },
    devServer: { port: 10086, host: "0.0.0.0", open: false },
  },
};
