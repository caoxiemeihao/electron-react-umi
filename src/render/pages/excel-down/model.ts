import { TableItem } from './utils/parse';

export interface XlsxState {
  /** 下载列表 */
  list: Array<TableItem>;
  /** 是否已经开始 */
  starred: boolean;
  /** 正在下载队列 */
  downArr: Array<string>;
}

export default {
  namespace: 'xlsx',
  state: {
    list: [],
    starred: false,
    downArr: [],
  } as XlsxState,
  reducers: {
    save(state: XlsxState, { payload }: any) {
      return { ...state, ...payload };
    },
    /** 这个有待完善 */
    process(state: XlsxState, { payload: { url, process } }: any) {
      return {
        ...state,
        list: state.list.map(item => ({
          ...item,
          process: url === item.Attachment ? process : item.process,
        })),
      };
    },
    status(state: XlsxState, { payload: { url, status } }: any) {
      return {
        ...state,
        list: state.list.map(item => ({
          ...item,
          status: url === item.Attachment ? status : item.status,
        })),
      };
    },
    error(state: XlsxState, { payload: { url, error } }: any) {
      return {
        ...state,
        list: state.list.map(item => ({
          ...item,
          error: url === item.Attachment ? error : item.error,
        })),
      };
    },
  },
};
