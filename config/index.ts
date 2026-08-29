/**
 * Taro 主配置 (weapp / h5 共用) · 端自身骨架
 *
 * 上游共享模块（contract-api / core-web / ui-native 等）待统一重构后接入，
 * 当前仅端自身：alias 只有 @ → src。
 */
import { resolve } from "path";
import { defineConfig } from "@tarojs/cli";

const projectRoot = resolve(__dirname, "..");

const alias = {
  "@": resolve(projectRoot, "src"),
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
