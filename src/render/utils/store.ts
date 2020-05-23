import Store from 'electron-store';

interface IStore extends Store {
  /** 主题 */
  theme: string;
}

const store = new Store() as IStore;

export default {
  set(key: string, value: any): void {
    store.set(key, value);
  },
  get(key: string | string[]): any {
    if (Array.isArray(key)) {
      return key.map(k => store.get(k));
    } else {
      return store.get(key);
    }
  },
  remove(key: string): void {
    store.delete(key);
  },
  clear(): void {
    store.clear();
  },

  /** 主题 */
  theme: 'THEM',
  /** 是否收起菜单 */
  collapsed: 'COLLAPSED',
  /** excel 图片下载位置 */
  pod_img_save_path: 'POD_IMG_SAVE_PATH',
};
