/**
 * 左侧菜单
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Menu } from 'antd';
import { SiderTheme } from 'antd/lib/layout/Sider';
import { useHistory } from 'umi';
import menus, { IMenu } from '@/config/menus';
import styles from './index.less';

const { SubMenu, Item } = Menu;
const subMenus: string[] = [];
const leafMenus: string[] = [];

// 获取所有父菜单的list
function getSubMenus(pathname: string): string[] {
  const path = pathname.split(/\/[^/]*$/)[0];

  if (path.includes('/')) {
    const res = getSubMenus(path);
    return [path, ...res];
  }
  return [path];
}

export default (props: { theme: SiderTheme }) => {
  const history = useHistory();
  const { location } = history;
  const [keys, setKeys] = useState([] as Array<string>);
  const [openKeys, setOpenKeys] = useState<any[]>([]);
  const { theme } = props;

  const clickMenu = ({ key }: any) => {
    history.push(key);
  };

  const generate = useMemo(() => {
    return (menus: Array<IMenu>, deep: string[] = []) => {
      return menus.map(menu => {
        const paths = [...deep, menu.path];
        const path = paths.join('');

        if (Array.isArray(menu.subs) && menu.subs.length) {
          // 保存存在子菜单的路由
          if (path && !subMenus.includes(path)) {
            subMenus.push(path);
          }

          return (
            <SubMenu key={path} icon={menu.icon} title={menu.title}>
              {generate(menu.subs, paths)}
            </SubMenu>
          );
        }

        // 保存存在叶子菜单的路由
        if (path && !leafMenus.includes(path)) {
          leafMenus.push(path);
        }
        return (
          <Item key={path} icon={menu.icon}>
            {menu.title}
          </Item>
        );
      });
    };
  }, [menus]);

  const handleOpenChange = (keys: any[]) => {
    setOpenKeys(keys);
  };

  useEffect(() => {
    const menuKey =
      leafMenus.find((v: string) => location.pathname.startsWith(v)) || '';
    setKeys([menuKey]);
  }, [location.pathname]);

  useEffect(() => {
    // 获取所有的父菜单的路由 list
    // 过滤无用的数据
    const keys = getSubMenus(location.pathname).filter(Boolean);
    // 获取匹配的父级菜单
    const exited = keys.filter((v: string) => subMenus.includes(v));
    setOpenKeys(exited);
  }, [location.pathname]);

  return (
    <Menu
      mode="inline"
      theme={theme}
      selectedKeys={keys}
      onClick={clickMenu}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      className={styles.menu}
    >
      {generate(menus)}
    </Menu>
  );
};
