/** Taro 入口（小程序页面根容器 · 端自身骨架） */
import type { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    // eslint-disable-next-line no-console -- 启动日志（有意保留）
    console.log('[LieShouCloud Mini] App launched.');
  });
  // children 是 Taro 自动注入的页面栈
  return children;
}

export default App;
