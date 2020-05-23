import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from 'antd';
import { SiderTheme } from 'antd/lib/layout/Sider';
import { useHistory, useLocation } from 'umi';
import cls from 'classnames';
import store from '@/utils/store';
import Header from './header';
import SideMenu from './menu';
import styles from './index.less';

const { Content, Sider } = Layout;

const BasicLayout: React.FC = (props: any) => {
  const location = useLocation();
  const history = useHistory();
  const [collapsed, setCollapsed] = useState(
    store.get(store.collapsed) || false,
  );
  const [theme, setTheme] = useState<SiderTheme>(
    store.get(store.theme) || 'light',
  );

  const clickCollapse = () => setCollapsed(!collapsed);
  const clickTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    document.body.classList.remove('dark');
    document.body.classList.remove('light');
    document.body.classList.add(theme);
    store.set(store.theme, theme);
  }, [theme]);

  useEffect(() => {
    store.set(store.collapsed, collapsed);
  }, [collapsed]);

  const LayoutMain = (
    <Layout className={styles.container}>
      <Header
        collapsed={collapsed}
        clickCollapse={clickCollapse}
        theme={theme}
        clickTheme={clickTheme}
      />
      <Layout>
        {/* 左侧菜单 */}
        <Sider theme={theme} collapsed={collapsed}>
          <SideMenu theme={theme} clickTheme={clickTheme} />
        </Sider>

        {/* 右侧 content */}
        <Layout>
          <Content className={styles.content}>{props.children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );

  const LayoutLogin = props.children;

  const LayoutDict: any = {
    '/User/login': LayoutLogin,
  };

  return LayoutDict[location.pathname]
    ? LayoutDict[location.pathname]
    : LayoutMain;
};

export default BasicLayout;
