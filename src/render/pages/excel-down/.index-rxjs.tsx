/**
 * POD excel 图片下载
 */
import React, { useState, useEffect } from 'react';
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
import { download, FLAG } from './utils/download';
import { XlsxState } from './model';
import styles from './index.less';

const img_path = store.pod_img_save_path;
const img_max = store.pod_img_down_max;
const { Group } = Button;
const STATUS_DICT = {
  warning: '等待开始',
  success: '下载完成',
  error: '下载失败',
  processing: '正在下载',
};

const ExcelDown: React.FC<any> = () => {
  const dispatch = useDispatch();
  const { list, starred } = useSelector<unknown, XlsxState>(
    ({ xlsx }: any) => xlsx,
  );
  const [savePath, setSavePath] = useState<string>(store.get(img_path) || '');
  const [downMax] = useState<number>(store.get(img_max) || 14);
  const [downArr, setDownArr] = useState<Array<TableItem>>([]);
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

  const clickDownload = () => {
    for (let i = 0, l = Math.min(list.length, downMax); i < l; i++) {
      const json = list[i];
      if (!list[i].error && list[i].Attachment) {
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

          const subject = download({
            url: json.Attachment as string,
            filename,
          });
          subject.subscribe(
            ([flag, url, data]) => {
              const item = list.find(item => item.Attachment === url);
              let status: PresetStatusColorType = 'warning';
              const filterDownArr = (url: string) => {
                setDownArr(
                  downArr.filter(({ Attachment }) => Attachment !== url),
                );
              };
              const joinDwonArr = (url: string) => {
                const item = list.find(({ Attachment }) => Attachment === url);
                item && setDownArr([...downArr, item]);
                // console.log('----', url, item, downArr);
              };

              if (flag === FLAG.params) {
                message.error(data);
              } else if (flag === FLAG.error) {
                console.log('请求出错', data);
                status = 'error';
              } else if (flag === FLAG.err) {
                // console.log('传输出错', data)
                status = 'error';
                filterDownArr(url);
              } else if (flag === FLAG.end) {
                // console.log('结束', data)
                status = 'success';
                filterDownArr(url);
              } else if (flag === FLAG.data) {
                // 下载中
              } else if (flag === FLAG.response200) {
                // console.log('下载开始', data)
                status = 'processing';
                joinDwonArr(url);
              } else if (flag === FLAG['!response200']) {
                console.log('请求出错', data);
                status = 'error';
              }

              if (flag !== FLAG.data) {
                // console.log(status, '----')
                dispatch({ type: 'xlsx/status', payload: { url, status } });
              }
            },
            () => {},
            () => subject.unsubscribe(),
          );
        } catch (e) {
          console.log(e);
          notification.error(e);
        }
      } else {
        console.warn('脏数据', json);
      }
    }
    dispatch({ type: 'xlsx/save', payload: { starred: true } }); // 开始下载
    message.info('开始下载咯 😁');
  };

  console.log('----------', downArr);

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

  const tableProps: TableProps<TableItem> = {
    size: 'small',
    dataSource: list,
    pagination: false,
    rowKey: (_, index) => String(index),
    columns: [
      { dataIndex: '$', title: '序号', width: 40, render: (_, __, i) => i + 1 },
      { dataIndex: 'OrderNumber', title: 'OrderNumber', width: 110 },
      { dataIndex: 'SKU', title: 'SKU', width: 224 },
      // { dataIndex: '下载进度', title: 'process', width: 90 },
      {
        dataIndex: '下载状态',
        title: 'status',
        render: (txt = 'warning') => (
          <Badge status={txt} text={STATUS_DICT[txt]} />
        ),
        width: 90,
      },
      { dataIndex: 'Attachment', title: 'Attachment' },
      {
        dataIndex: 'operate',
        title: '操作',
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
            <Button size="small" disabled={!record.resume}>
              重新下载
            </Button>
          </>
        ),
        width: 160,
      },
    ],
  };

  return (
    <Card className={styles.xlsx}>
      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex">
          <Group>
            <Button onClick={clickChooseFile}>选择 excel 文件</Button>
            <Button onClick={clickDownload} disabled={!list?.length || starred}>
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
