import React, { useCallback, useState } from 'react';
import { useHistory } from 'umi';
import { ipcRenderer } from 'electron';
import { Layout, Switch, Tooltip } from 'antd';
import { SiderTheme } from 'antd/lib/layout/Sider';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ReloadOutlined,
  WindowsOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import cls from 'classnames';
import './header.less';

export interface IProps {
  clickCollapse: () => void;
  collapsed: boolean;
  theme: SiderTheme;
}

const { Header } = Layout;

const HeaderComponent: React.FC<IProps> = props => {
  const { collapsed, clickCollapse, theme } = props;
  const history = useHistory();
  const isLight = theme === 'light';

  const devtool = (
    <div className={cls('header-devtool', { collapsed })}>
      <div className="btn-group">
        <span onClick={clickCollapse} className="cursor-pointer">
          <Tooltip title={collapsed ? '展开菜单' : '收起菜单'}>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            )}
          </Tooltip>
        </span>
        <Tooltip title="切换开发者工具">
          <ControlOutlined
            onClick={() => ipcRenderer.send('toggle-devtools')}
          />
        </Tooltip>
        <Tooltip title="首页">
          <WindowsOutlined onClick={() => history.push('/')} />
        </Tooltip>
        <ArrowLeftOutlined onClick={() => history.goBack()} />
        <ArrowRightOutlined onClick={() => history.goForward()} />
        <ReloadOutlined onClick={() => window.location.reload(true)} />
      </div>
      <div className={cls('href ml-2', { production: !window.G.isDev })}>
        {location.href}
      </div>
    </div>
  );

  return (
    <Header className={cls('layout-top-eader', { 'bg-white': isLight })}>
      <div className="d-flex align-items-center">
        <div className={cls('logo pl-2', { collapsed })}>
          <h1>
            <span className={cls({ 'opacity-0': isLight })}>草</span>
            <img
              src={require('@/assets/icon-40@3x.png')}
              className={cls({ 'opacity-0': !isLight })}
            />
          </h1>
        </div>
        <div className="flex-fill">{devtool}</div>
      </div>
    </Header>
  );
};

export default HeaderComponent;
