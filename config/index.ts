/**
 * Taro 主配置 (weapp / h5 共用) · 端自身骨架 + 统一上游（2026-08）
 *
 * monorepo 适配:
 *  - alias 必须与 tsconfig.json paths 完全一致
 *  - 共享包源码（open/*）需加入 compile.include，webpack 才能用 babel 编译
 */
import { existsSync, readdirSync, statSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "@tarojs/cli";

const projectRoot = resolve(__dirname, "..");

// 客户聚合仓模式（2026-08）：客户仓 packages/<client> → @lieshoucloud/<client>
// 独立仓库（无 ../packages）跳过，行为不变。webpack alias 前缀匹配，子路径自动拼接。
const clientRoot = resolve(projectRoot, "../packages");
const clientAlias: Record<string, string> = {};
const clientIncludes: string[] = [];
if (existsSync(clientRoot)) {
  for (const name of readdirSync(clientRoot)) {
    if (!statSync(resolve(clientRoot, name)).isDirectory()) continue;
    const src = resolve(clientRoot, name, "src");
    clientAlias[`@lieshoucloud/${name}`] = src;
    clientAlias[`@lieshoucloud/${name}/*`] = `${src}/*`;
    clientIncludes.push(src);
  }
}

const alias = {
  "@": resolve(projectRoot, "src"),
  "@lieshoucloud/contract-api": resolve(projectRoot, "open/contract-api/src"),
  "@lieshoucloud/contract-config": resolve(projectRoot, "open/contract-config/src"),
  "@lieshoucloud/contract-types": resolve(projectRoot, "open/contract-types/src"),
  "@lieshoucloud/core-web": resolve(projectRoot, "open/core-web/src"),
  "@lieshoucloud/i18n": resolve(projectRoot, "open/i18n/src"),
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
  plugins: ["@tarojs/plugin-framework-react"],
  defineConstants: {
    // 构建期注入（webpack5 DefinePlugin 替换，浏览器运行时无 process 全局）：
    // api.ts / editions 直接读 process.env.*，替换后为字面量，无 typeof 守卫短路问题
    'process.env.TARO_ENV': JSON.stringify(process.env.TARO_ENV || ''),
    'process.env.TARO_APP_API_BASE': JSON.stringify(process.env.TARO_APP_API_BASE || ''),
    'process.env.TARO_APP_EDITION': JSON.stringify(process.env.TARO_APP_EDITION || ''),
  },
  copy: {
    patterns: [],
    options: {},
  },
  framework: "react",
  // webpack5 显式声明（缺省时 config.compiler 非对象 → H5 prebundleOptions 为 undefined 崩溃）
  compiler: {
    type: 'webpack5',
    prebundle: { enable: false },
  },
  compilerOptions: {
    alias,
  },
  cache: { enable: false },
  mini: {
    webpackChain(chain) {
      for (const [name, src] of Object.entries(alias)) {
        chain.resolve.alias.set(name, src);
      }
    },
    compile: {
      include: [
        resolve(projectRoot, "open/contract-api/src"),
        resolve(projectRoot, "open/contract-config/src"),
        resolve(projectRoot, "open/contract-types/src"),
        resolve(projectRoot, "open/core-web/src"),
        resolve(projectRoot, "open/i18n/src"),
        ...clientIncludes,
      ],
    },
  },
  // H5 配置（按需启用 --type h5）
  // publicPath 支持环境变量覆盖（子路径部署预览，如 TARO_APP_H5_PUBLIC_PATH=/mini-program/）
  h5: {
    // 共享包源码（open/*）+ 客户包（packages/<client>）需要 babel 编译（webpack 默认只编译 sourceRoot）
    compile: {
      include: [
        resolve(projectRoot, 'open/contract-api/src'),
        resolve(projectRoot, 'open/contract-config/src'),
        resolve(projectRoot, 'open/contract-types/src'),
        resolve(projectRoot, 'open/core-web/src'),
        resolve(projectRoot, 'open/i18n/src'),
        ...clientIncludes,
      ],
    },
    webpackChain(chain) {
      for (const [name, src] of Object.entries(alias)) {
        chain.resolve.alias.set(name, src);
      }
    },
    publicPath: process.env.TARO_APP_H5_PUBLIC_PATH?.trim() || "/",
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
    devServer: { port: 21303, host: "0.0.0.0", open: false, hot: false },
  },
});
