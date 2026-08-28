/**
 * MiniUI 业务小组件单测（P0 · 三端补测试）.
 *
 * 组件是纯函数返回 Taro 元素（@tarojs/components 的 View/Text）。
 * 直接调用组件函数断言元素结构与文案，避免依赖 jsdom 渲染 Taro 组件。
 */
import { describe, expect, it } from "vitest";

import { EmptyState, RoleBadge, StatusBadge } from "./MiniUI";

type El = { props: { children?: unknown } };

function collectText(node: unknown, out: string[] = []): string[] {
  if (node === null || node === undefined) return out;
  if (typeof node === "string" || typeof node === "number") {
    out.push(String(node));
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((n) => collectText(n, out));
    return out;
  }
  if (typeof node === "object") {
    const el = node as El;
    collectText(el.props?.children, out);
  }
  return out;
}

describe("mini-program MiniUI", () => {
  it("StatusBadge 文案透传", () => {
    const el = StatusBadge({ text: "已转化", color: "#52c41a" }) as El;
    expect(collectText(el.props.children).join("")).toBe("已转化");
  });

  it("RoleBadge 渲染角色码（PLATFORM_ADMIN）", () => {
    const el = RoleBadge({ role: "PLATFORM_ADMIN" }) as El;
    expect(collectText(el.props.children).join("")).toBe("PLATFORM_ADMIN");
  });

  it("RoleBadge 未知角色兜底不炸", () => {
    const el = RoleBadge({ role: "SOMETHING_ELSE" }) as El;
    expect(collectText(el.props.children).join("")).toBe("SOMETHING_ELSE");
  });

  it("EmptyState 默认文案「暂无数据」", () => {
    const el = EmptyState({}) as El;
    expect(collectText(el.props.children).join("")).toContain("暂无数据");
  });

  it("EmptyState 自定义文案透传", () => {
    const el = EmptyState({ message: "还没有商品" }) as El;
    expect(collectText(el.props.children).join("")).toContain("还没有商品");
  });
});
