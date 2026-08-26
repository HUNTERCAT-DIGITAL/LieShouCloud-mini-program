/**
 * 客户仓注入槽位（客户聚合仓模式 · 2026-09）.
 * 独立仓库：占位（空）；客户仓 deploy:prepare 会覆盖本文件注入 EXTRA_PAGES。
 * 注：Taro(webpack5) 不支持 import.meta.glob，故采用单一槽位文件；
 * 一个部署 = 一个客户，槽位文件名保持中性（extra），不绑定具体客户。
 */
export const EXTRA_PAGES: string[] = [];
