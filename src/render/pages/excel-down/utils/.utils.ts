import XLSX from 'xlsx';

/** 抽出有用列 */
export function getUseful(workbook: XLSX.WorkBook, useful_col?: Array<string>) {
  console.log(workbook);
  const useful = useful_col
    ? useful_col
    : ['OrderNumber', 'SKU', 'quantity', 'Attachment'];

  // 第一张表
  const firstSheetName = workbook.SheetNames[0];
  const sheetJsonData = workbook.Sheets[firstSheetName];

  // 提取期待的 列名称、列编号
  const expected_keys: { [key: string]: string } = {}; // {OrderNumber: "B", SKU: "C", quantity: "E", Attachment: "S"}
  Object.entries(sheetJsonData).forEach(([key, val]) => {
    if (useful.includes(val.v)) {
      expected_keys[val.v] = key[0];
    }
  });
  // console.log(expected_keys);

  // 根据 expected_keys 提取期待的数据集合
  const expected_arr: Array<{ [key: string]: any }> = [
    // {OrderNumber: "#2812", SKU: "CJJJJTCF00488-Heart-Blue box*1;@1", Attachment: "https://uploadery.s3.amazonaws.com/meta-charms/e49b772a-IMG_49911.jpg"}
  ];
  Object.entries(sheetJsonData).forEach(([key, val]) => {
    const json: any = {};
    Object.entries(expected_keys).forEach(([k, v]) => {
      if (key.startsWith(v)) {
        json[k] = val.v;
      }
    });
    if (Object.keys(json).length) {
      expected_arr.push(json);
    }
  });
  console.log(expected_arr);
}
