/**
 * 左侧菜单配置
 */
import React from 'react';
import {
  AreaChartOutlined,
  FileImageOutlined,
  SearchOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';

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
              path: '/foo',
              icon: <AreaChartOutlined />,
            },
          ],
        },
      ]
    : []),
  {
    path: '/excel-down',
    title: 'excel 图片下载',
    icon: <FileImageOutlined />,
  },
  {
    path: '/source-utils',
    title: '搜品助手',
    icon: <SearchOutlined />,
  },
  {
    path: '/excel-parse',
    title: 'excel 解析',
    icon: <FileExcelOutlined />,
  },
] as Array<IMenu>;
