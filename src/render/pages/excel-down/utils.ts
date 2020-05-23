import XLSX from 'xlsx';

/** 抽出有用列 */
export function getUseful(workbook: XLSX.WorkBook, useful_col?: Array<string>) {
  const useful = useful_col
    ? useful_col
    : ['OrderNumber', 'SKU', 'quantity', 'Attachment'];

  // 第一张表
  const firstSheetName = workbook.SheetNames[0];
  const sheetJsonData = workbook.Sheets[firstSheetName];

  const expected_keys: any = {}; // {OrderNumber: "B", SKU: "C", quantity: "E", Attachment: "S"}
  Object.entries(sheetJsonData).forEach(([key, val]) => {
    if (useful.includes(val.v)) {
      expected_keys[val.v] = key[0];
    }
  });

  const expectedArr = [
    // {OrderNumber: "#2812", SKU: "CJJJJTCF00488-Heart-Blue box*1;@1", Attachment: "https://uploadery.s3.amazonaws.com/meta-charms/e49b772a-IMG_49911.jpg"}
  ];

  console.log(expected_keys);
}
