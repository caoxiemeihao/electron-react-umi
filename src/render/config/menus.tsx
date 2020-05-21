/**
 * 左侧菜单配置
 */
import React from 'react';
import { AreaChartOutlined } from '@ant-design/icons';

export interface IMenu {
  title: string;
  path: string;
  fullPath?: string;
  icon?: React.ReactNode;
  subs?: Array<IMenu>;
  electron?: boolean;
}

export default [
  ...(window.G.isDev
    ? [
        {
          title: 'Dashboard',
          path: '',
          icon: <AreaChartOutlined />,
          subs: [
            {
              title: 'Foo',
              path: '/Foo',
              fullPath: '/Foo',
              icon: <AreaChartOutlined />,
            },
          ],
        },
      ]
    : []),
] as Array<IMenu>;
