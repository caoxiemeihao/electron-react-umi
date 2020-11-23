/**
 * excel 解析 Demo
 * https://www.cnblogs.com/sugar-tomato/p/4533977.html
 */
import React, { useState, useEffect } from 'react';
import { Button, message, Table, Divider } from 'antd';
import { TableProps, ColumnType } from 'antd/lib/table';
import XLSX from 'xlsx';
import styles from './index.less';

export interface ExcelRecord {
  Address: '广州市白云区嘉禾街新科村永嘉路28号502室(自主申报)';
  Bank: '中国工商银行股份有限公司广州高新技术开发区支行';
  Bankaccount: '3602008109200823519';
  CreditCode: '91440101MA5AL1H35K';
  Name: '广州味捷企业管理有限公司';
  PhoneNumber: '18318100125';
}

export default () => {
  const [act, setAct] = useState(false);
  const [file, setFile] = useState<File>();
  const [dataSource, setDataSource] = useState<Array<ExcelRecord>>([]);
  const [columns, setColumns] = useState<Array<ColumnType<ExcelRecord>>>([]);

  const tableProps: TableProps<ExcelRecord> = {
    columns,
    dataSource,
    pagination: false,
    rowKey: (_, idx) => String(idx),
    size: 'small',
    scroll: { x: 1200 },
  };

  const parseExcel = async (p: string) => {
    const workBook: XLSX.WorkBook = XLSX.readFile(p);
    const sheet1: XLSX.Sheet = workBook.Sheets[workBook.SheetNames[0]];
    if (!sheet1) {
      message.warn('excel 为空');
      return;
    }
    // console.log(sheet1)

    const titles: Array<[string, XLSX.CellObject]> = Object.entries(
      sheet1,
    ).filter((item: [string, XLSX.CellObject]) => {
      // CellObject
      // h: "广州市白云区嘉禾街新科村永嘉路28号502室(自主申报)"
      // r: "<t>广州市白云区嘉禾街新科村永嘉路28号502室(自主申报)</t>"
      // t: "s"
      // v: "广州市白云区嘉禾街新科村永嘉路28号502室(自主申报)"
      // w: "广州市白云区嘉禾街新科村永嘉路28号502室(自主申报)"
      const [key, cell] = item;
      return key.replace(/[^\d+]/, '') === '1';
    });
    // console.log(titles)

    let dataList: Array<[
      string,
      XLSX.CellObject,
      Record<string | number, any>,
    ]> = titles.map(_ => [..._, {}]);
    for (const cellItem of Object.entries(sheet1)) {
      const [dataKey, dataCell] = cellItem as [string, XLSX.CellObject];
      if (dataList.find(t => t[0] === dataKey)) continue; // 过滤掉 title 行

      const dataItem = { [dataKey]: dataCell.w };
      dataList = dataList.map(d =>
        d[0][0] === dataKey[0]
          ? [d[0], d[1], Object.assign(d[2], dataItem)] // 将数据合并到对应列
          : d,
      );
    }
    // console.log(dataList)

    const maxRow = (
      (sheet1[/* A1:F10 */ '!ref']?.split(':') || [])[1] || ''
    ).replace(/[^\d+]/, '');
    if (!maxRow) {
      message.warn('数据行为空');
      return;
    }
    const dataSource: Array<ExcelRecord> = [];
    for (let x = 1; x < +maxRow; x++) {
      // x = 1：“第一行为标题行”
      const dataRecord: Record<string, any> = {};
      for (const dataItem of dataList) {
        dataRecord[dataItem[1].w as string] =
          dataItem[2][`${dataItem[0][0]}${x + 1}`]; // x + 1：“XLSX为自然数下标”
      }

      dataSource.push(dataRecord as ExcelRecord);
    }
    // console.log(dataSource)

    setColumns(titles.map(t => ({ title: t[1].w, dataIndex: t[1].w })));
    setDataSource(dataSource);
  };

  // ======================================================= drag
  const dragEnter = (ev: any) => {
    // console.log('dragEnter', ev)
  };
  const dragOver = (ev: any) => {
    ev.preventDefault();
    setAct(true);
  };
  const dragLeave = (ev: any) => {
    setAct(false);
    // console.log('dragLeave', ev)
  };
  const drop = (ev: any) => {
    setAct(false);
    const event: DragEvent = ev.nativeEvent;
    const file: File = (event.dataTransfer?.files || [])[0];
    if (!file) {
      message.warn('未读取到文件');
      return;
    }
    // console.log(file)
    setFile(file);
    parseExcel(file.path);
  };
  // ======================================================= drag

  const clickUpload = (ev: any) => {
    const oInput = document.createElement('input');
    oInput.type = 'file';
    oInput.onchange = (event: any) => {
      const file: File = (event.target?.files || [])[0];
      if (!file) {
        message.warn('未读取到文件');
        return;
      }
      // console.log(file)
      setFile(file);
      parseExcel(file.path);
    };
    oInput.click();
  };

  // -------------------------------------------------------- test
  const documentDragOver = (ev: any) => {
    ev.preventDefault();
    // console.log('documentDragOver', ev)
  };
  const documentDragLeave = (ev: any) => {
    console.log('documentDragLeave', ev);
  };
  const documentDragEnter = (ev: any) => {
    console.log('documentDragEnter', ev);
  };
  useEffect(() => {
    return;
    document.addEventListener('dragenter', documentDragEnter);
    document.addEventListener('dragover', documentDragOver);
    document.addEventListener('dragleave', documentDragLeave);
    // document.addEventListener('dragend', documentDragEnd) // 不会触发
    return () => {
      document.removeEventListener('dragenter', documentDragEnter);
      document.removeEventListener('dragover', documentDragOver);
      document.removeEventListener('dragleave', documentDragLeave);
    };
  }, []);
  // -------------------------------------------------------- test

  return (
    <div className={styles.excelParse}>
      <div style={{ marginBottom: 10 }}>
        <Button
          type={act ? 'primary' : undefined}
          onDragEnter={dragEnter}
          onDragOver={dragOver}
          onDragLeave={dragLeave}
          onDrop={drop}
          onClick={clickUpload}
        >
          点击 / 拖文件到此处
        </Button>
        <span style={{ marginLeft: 7 }}>
          {file ? (
            file.path
          ) : (
            <span style={{ color: 'red' }}>
              {'测试文件使用 【项目根目录/xlsx/公司信息.xlsx】'}
            </span>
          )}
        </span>
      </div>

      <Table {...tableProps} />
    </div>
  );
};
