/**
 * POD excel 图片下载
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Alert, Button, message, Modal, notification, Badge } from 'antd';
import Table, { TableProps } from 'antd/lib/table';
import { PresetStatusColorType } from 'antd/lib/_util/colors';
import { ipcRenderer as ipc } from 'electron';
import { useSelector, useDispatch } from 'umi';
import fs, { stat } from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { chooseFile, copyToClipboard } from '@/utils';
import store from '@/utils/store';
import { parse, TableItem, EAttachmentType } from './utils/parse';
import {
  download,
  FLAG,
  events,
  DOWNLOAD_EVENT,
  DOWNLOAD_ARGS,
} from './utils/download';
import { XlsxState } from './model';
import styles from './index.less';

const img_path = store.pod_img_save_path;
const img_max = store.pod_img_down_max;
const { Group } = Button;
const STATUS_DICT: any = {
  default: '等待开始',
  warning: '链接资源',
  success: '下载完成',
  error: '下载失败',
  processing: '正在下载',
};

const ExcelDown: React.FC<any> = () => {
  const dispatch = useDispatch();
  const xlsxState = useSelector<unknown, XlsxState>(({ xlsx }: any) => xlsx);
  const { list, starred, downArr } = xlsxState;
  const [savePath, setSavePath] = useState<string>(store.get(img_path) || '');
  const [downMax] = useState<number>(store.get(img_max) || 19);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook>();

  const openDialog = () => {
    ipc.send('open-choose-download-path');
  };

  const clickChooseFile = async () => {
    if (!savePath) {
      return message.warning('请先选择保存位置，不然下载的图片放哪里呢？😀');
    }
    const [err, file] = await chooseFile();
    const book = XLSX.readFile(file.path);
    setWorkbook(book);
  };

  const execDownload = useCallback((json: TableItem) => {
    try {
      const arr1 = json.SKU.split(' '); // SKU: "CJJJJTCF00488-Heart-Blue box*1;@1"
      const dirName = arr1[0].split('-')[1];
      const sum =
        json.AttachmentType === EAttachmentType.uploadery // 19-11-14 mod
          ? json.quantity || arr1[1].split('*')[1]
          : json.quantity; /** 其實兩者都可以用 quantity */
      const target = path.join(savePath, String(dirName), String(sum));
      fs.existsSync(target) || fs.mkdirSync(target, { recursive: true });
      const filename = path.join(
        target,
        json.OrderNumber +
          json.Attachment.substring(json.Attachment.lastIndexOf('.')),
      );

      download({ url: json.Attachment as string, filename });
      dispatch({
        type: 'xlsx/status',
        payload: { url: json.Attachment, status: 'warning' },
      });
    } catch (e) {
      console.log(e);
      notification.error(e);
    }
  }, []);

  const clickDownload = () => {
    const down = () => {
      for (let i = 0, l = Math.min(list.length, downMax); i < l; i++) {
        const item = list[i];
        if (item.Attachment) {
          setTimeout(() => {
            // 优化页面卡顿
            execDownload(item); // 初始启动下载
          }, i * 19);
        } else {
          console.warn('脏数据', item);
        }
      }
      // dispatch({ type: 'xlsx/save', payload: { starred: true } }); // 开始下载
      message.info('开始下载咯 😁');
    };
    const item = list.find(({ status }) => status !== undefined);
    if (item) {
      Modal.confirm({
        content: '下载已经在进行了，你酱紫会导致重新开始下载任务 😀',
        onOk() {
          down();
        },
      });
    } else {
      down();
    }
  };

  useEffect(() => {
    events.removeAllListeners(DOWNLOAD_EVENT);
    events.on(DOWNLOAD_EVENT, ([flag, url, data]: DOWNLOAD_ARGS) => {
      let status: PresetStatusColorType = 'default';
      let error: any;
      const filterDownArr = (url: string) => {
        dispatch({
          type: 'xlsx/save',
          payload: {
            downArr: downArr.filter(_url => _url !== url),
          },
        });
      };
      const joinDwonArr = (url: string) => {
        dispatch({
          type: 'xlsx/save',
          payload: { downArr: [...downArr.filter(_url => _url !== url), url] },
        });
      };

      if (flag === FLAG.params) {
        message.error(data);
      } else if (flag === FLAG.error) {
        console.log('http.get 出错', data);
        status = 'error';
        error = data;
      } else if (flag === FLAG.err) {
        console.log('res.err 出错', data);
        status = 'error';
        filterDownArr(url);
      } else if (flag === FLAG.end) {
        // 结束
        status = 'success';
        filterDownArr(url);
        const item = list.find(({ status }) => status === undefined);
        item && execDownload(item);
      } else if (flag === FLAG.data) {
        // 下载中
      } else if (flag === FLAG.response200) {
        // 下载开始
        joinDwonArr(url);
        status = 'processing';
        if (!starred) {
          dispatch({ type: 'xlsx/save', payload: { starred: true } }); // 开始下载
        }
      } else if (flag === FLAG['!response200']) {
        console.log('statusCode 出错', data);
        status = 'error';
        error = data;
      }

      if (status !== 'default') {
        dispatch({ type: 'xlsx/status', payload: { url, status } });
      }
      if (error) {
        dispatch({ type: 'xlsx/error', payload: { url, error } });
      }
    });
  }, [list, downArr]);

  useEffect(() => {
    if (workbook) {
      parse(workbook).then(([err, data]) => {
        const cb = () =>
          dispatch({
            type: 'xlsx/save',
            payload: { list: data, starred: false },
          });
        if (!err) {
          console.log('xlsx数据:', data);
          if (list.length) {
            Modal.confirm({
              title: '🤔',
              content: '已有下载任务，新数据将覆盖已有任务？',
              onOk() {
                cb();
              },
            });
          } else {
            cb();
          }
        }
      });
    }
  }, [workbook]);

  useEffect(() => {
    const evnet = ipc.on('choosed-download-path', (event, save_path) => {
      setSavePath(save_path);
    });
    return () => {
      evnet.removeAllListeners('choosed-download-path');
    };
  }, []);

  useEffect(() => store.set(img_path, savePath), [savePath]);

  const tableProps: TableProps<TableItem> = useMemo(
    () => ({
      size: 'small',
      dataSource: list,
      pagination: false,
      rowKey: (_, index) => String(index),
      columns: [
        { dataIndex: '$', title: '#', width: 40, render: (_, __, i) => i + 1 },
        { dataIndex: 'OrderNumber', title: 'OrderNumber', width: 110 },
        { dataIndex: 'SKU', title: 'SKU', width: 224 },
        // { dataIndex: 'process', title: 'process', width: 90 }, // 有待完善
        {
          dataIndex: 'status',
          title: 'status',
          render: (txt = 'default') => (
            <Badge status={txt} text={STATUS_DICT[txt]} />
          ),
          width: 90,
        },
        { dataIndex: 'Attachment', title: 'Attachment' },
        {
          dataIndex: 'operate',
          title: 'operate',
          render: (txt, record) => (
            <>
              <Button
                size="small"
                className="mr-2"
                type="dashed"
                onClick={() => {
                  copyToClipboard(record.Attachment);
                  message.success('复制成功');
                }}
              >
                复制链接
              </Button>
              <Button
                size="small"
                // disabled={!record.error}
                onClick={() => {
                  execDownload(record);
                }}
              >
                下载
              </Button>
            </>
          ),
          width: 140,
        },
      ],
    }),
    [list],
  );

  return (
    <Card className={styles.xlsx}>
      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex">
          <Group>
            <Button onClick={clickChooseFile}>选择 excel 文件</Button>
            <Button onClick={clickDownload} disabled={!list?.length}>
              开始下载
            </Button>
          </Group>
          <Alert
            type="info"
            className="p-5-15 ml-2 cursor-pointer"
            message={`保存位置: ${savePath}`}
            onClick={openDialog}
          />
        </div>
        <div className="d-flex">
          <Alert
            type="info"
            className="p-5-15"
            message={`当前任务数: ${downArr.length}`}
          />
        </div>
      </div>
      <Table {...tableProps} />
    </Card>
  );
};

export default ExcelDown;
