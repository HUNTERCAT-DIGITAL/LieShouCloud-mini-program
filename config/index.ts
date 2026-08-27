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
import { existsSync, readdirSync, statSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "@tarojs/cli";

const projectRoot = resolve(__dirname, "..");
const monorepoRoot = projectRoot; // 独立仓库：根即 monorepo 根（open/ submodule）

// 客户聚合仓模式（2026-09）：客户仓 packages/<client> → @lieshoucloud/<client>
// 对齐 admin-web vite / mobile Metro 客户包兜底；独立仓库（无 ../packages）跳过，行为不变。
// webpack alias 无 $ 后缀 = 前缀匹配，子路径（@lieshoucloud/legalmind/api）自动拼接。
const clientRoot = resolve(monorepoRoot, "../packages");
const clientAlias: Record<string, string> = {};
const clientIncludes: string[] = [];
if (existsSync(clientRoot)) {
  for (const name of readdirSync(clientRoot)) {
    if (!statSync(resolve(clientRoot, name)).isDirectory()) continue;
    const src = resolve(clientRoot, name, "src");
    // 精确 + 子路径通配（webpack alias：key 以 * 结尾 = 前缀匹配，value 的 * 展开）
    clientAlias[`@lieshoucloud/${name}`] = src;
    clientAlias[`@lieshoucloud/${name}/*`] = `${src}/*`;
    clientIncludes.push(src);
  }
}

const alias = {
  "@": resolve(projectRoot, "src"),
  "@lieshoucloud/contract-api": resolve(monorepoRoot, "open/contract-api/src"),
  "@lieshoucloud/contract-types": resolve(monorepoRoot, "open/contract-types/src"),
  "@lieshoucloud/core-web": resolve(monorepoRoot, "open/core-web/src"),
  ...clientAlias,
};

export default defineConfig({
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
  // 客户聚合仓模式（2026-09）：webpack-chain 直接设置客户包 resolve.alias
  // （compilerOptions.alias 对子路径 import 不生效，此处必生效；独立仓库无客户包则空转）
  mini: {
    webpackChain(chain) {
      for (const [name, src] of Object.entries(clientAlias)) {
        chain.resolve.alias.set(name, src);
      }
    },
    compile: {
      include: [
        resolve(monorepoRoot, "open/contract-api/src"),
        resolve(monorepoRoot, "open/contract-types/src"),
        resolve(monorepoRoot, "open/contract-config/src"),
        resolve(monorepoRoot, "open/core-web/src"),
        ...clientIncludes,
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
});
