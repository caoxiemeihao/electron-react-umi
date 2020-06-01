import { SiderTheme } from 'antd/lib/layout/Sider';
import store from '@/utils/store';

export interface GlobalState {
  /** 全局主题 */
  theme: SiderTheme;
}

/** 切换主题 */
function switchThem(theme: SiderTheme = store.get(store.theme) ?? 'light') {
  document.body.classList.remove('dark');
  document.body.classList.remove('light');
  document.body.classList.add(theme);
}

export default {
  namespace: 'global',
  state: {
    theme: store.get(store.theme),
  } as GlobalState,
  reducers: {
    theme(state: any, { theme }: { theme: SiderTheme }) {
      switchThem(theme);
      store.set(store.theme, theme);
      return { ...state, theme };
    },
    save(state: any, { payload }: any) {
      return { ...state, ...payload };
    },
  },
  subscriptions: {
    setup({ dispatch, history }: any) {
      switchThem();
    },
  },
};
