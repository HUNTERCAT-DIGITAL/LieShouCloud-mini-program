/**
 * Taro 主配置 (weapp / h5 共用) · 端自身骨架 + 统一上游（2026-08）
 *
 * monorepo 适配:
 *  - alias 必须与 tsconfig.json paths 完全一致
 *  - 共享包源码（open/*）需加入 compile.include，webpack 才能用 babel 编译
 */
import { resolve } from "path";
import { defineConfig } from "@tarojs/cli";

const projectRoot = resolve(__dirname, "..");

const alias = {
  "@": resolve(projectRoot, "src"),
  "@lieshoucloud/contract-api": resolve(projectRoot, "open/contract-api/src"),
  "@lieshoucloud/contract-config": resolve(projectRoot, "open/contract-config/src"),
  "@lieshoucloud/contract-types": resolve(projectRoot, "open/contract-types/src"),
  "@lieshoucloud/core-web": resolve(projectRoot, "open/core-web/src"),
  "@lieshoucloud/i18n": resolve(projectRoot, "open/i18n/src"),
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
