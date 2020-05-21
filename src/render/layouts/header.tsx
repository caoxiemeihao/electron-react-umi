import React, { useCallback, useState } from 'react';
import { useHistory } from 'umi';
// import { ipcRenderer } from 'electron'
import { Layout } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import cls from 'classnames';
import './header.less';

const isDev = process.env.NODE_ENV === 'development';

export interface IProps {
  clickCollapse: () => void;
  collapsed: boolean;
}

const { Header } = Layout;

const HeaderComponent: React.FC<IProps> = props => {
  const { collapsed, clickCollapse } = props;
  const history = useHistory();

  const devtool = (
    <div className={cls('header-devtool', { collapsed })}>
      <div className="btn-group">
        {/* <ControlOutlined onClick={() => ipcRenderer.send('toggle-devtool')} /> */}
        <ArrowLeftOutlined onClick={() => history.goBack()} />
        <ArrowRightOutlined onClick={() => history.goForward()} />
        <ReloadOutlined onClick={() => window.location.reload(true)} />
      </div>
      <div className="href ml-2">{location.href}</div>
    </div>
  );

  return (
    <Header className="layout-top-eader">
      <div className="d-flex align-items-center">
        <div className={cls('logo pl-2', { collapsed })}>
          <h1>
            <span>草</span>
          </h1>
          <span
            className="pl-4 pr-4 cursor-pointer btn"
            onClick={clickCollapse}
          >
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            )}
          </span>
        </div>
        <div className="flex-fill">{devtool}</div>
      </div>
    </Header>
  );
};

export default HeaderComponent;
