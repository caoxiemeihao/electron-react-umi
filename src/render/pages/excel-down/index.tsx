/**
 * POD excel 图片下载
 */
import React, { useState, useEffect } from 'react';
import { Alert, Button, message } from 'antd';
import { ipcRenderer as ipc } from 'electron';
import XLSX from 'xlsx';
import {} from '@/utils/xlsx';
import { chooseFile } from '@/utils';
import store from '@/utils/store';
import { getUseful } from './utils';
import styles from './index.less';

const img_path = store.pod_img_save_path;
const { Group } = Button;

const ExcelDown: React.FC<any> = () => {
  const [savePath, setSavePath] = useState<string>(store.get(img_path) || '');
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

  useEffect(() => {
    if (workbook) {
      getUseful(workbook);
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

  return (
    <div className={styles.xlsx}>
      <div className="d-flex">
        <Group>
          <Button onClick={clickChooseFile}>选择 excel 文件</Button>
          <Alert
            type="info"
            className="p-5-15 ml-2 cursor-pointer"
            message={`保存位置: ${savePath}`}
            onClick={openDialog}
          />
        </Group>
      </div>
      <hr />
    </div>
  );
};

export default ExcelDown;
