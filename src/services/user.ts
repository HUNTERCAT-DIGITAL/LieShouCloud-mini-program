/**
 * 小程序 user service —— 2026-09 下沉 core-web：用户列表由
 * @lieshoucloud/core-web features/user（user.api.ts）提供（业务逻辑唯一源）。
 * UserOption 为审批人下拉裁剪 DTO（仅取发起审批所需字段，AGENTS.md 判定合理保留）；
 * core-web 返回全量 User（字段超集），此处端侧裁剪类型。
 */
import { listUsers as coreListUsers } from "@lieshoucloud/core-web";

export interface UserOption {
  id: number;
  username: string;
  displayName?: string | null;
  status?: string;
}

/** 租户用户列表（gateway 自动注入 X-Tenant-Id） */
export async function listUsers(): Promise<UserOption[]> {
  return coreListUsers();
}
