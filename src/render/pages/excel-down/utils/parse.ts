import XLSX from 'xlsx';

// ---- 19-11-14 ---- add 兼容 cj、shopify-uploadery
enum EAttachmentType {
  cj = 'cj-compatible',
  uploadery = 'shopify-uploadery',
}

export interface IUsefulKeys {
  OrderNumber: string;
  SKU: string;
  quantity: string;
  Attachment: string;
}

export interface IUsefulItem {
  OrderNumber: string;
  SKU: string;
  quantity: string;
  AttachmentType: EAttachmentType;
  Attachment?: Array<string> | null;
  error?: string;
}

/**
 * excel 解析
 * @param workbook
 */
export function parse(
  workbook: XLSX.WorkBook,
): Promise<[null | string, Array<IUsefulItem>]> {
  // console.log(workbook)

  return new Promise(resolve => {
    try {
      /**
       * SheetNames 代表一个excel中有几张表
       * Sheets JSON格式数据集合，key为行、列拼装，value为单元格数据
       * Strings 数组格式数据集合
       **/

      const firstSheetName = workbook.SheetNames[0];
      const sheetJsonData = workbook.Sheets[firstSheetName];

      // { OrderNumber: 'B', SKU: 'C', quantity: 'E', Attachment: 'S' }
      const expectedKeys: IUsefulKeys = {} as IUsefulKeys;

      Object.keys(sheetJsonData).forEach(item => {
        if ('OrderNumber' === sheetJsonData[item].v) {
          expectedKeys.OrderNumber = item.substr(0, 1);
        }
        if ('SKU' === sheetJsonData[item].v) {
          expectedKeys.SKU = item.substr(0, 1);
        }
        if ('quantity' === sheetJsonData[item].v) {
          // 19-11-14
          expectedKeys.quantity = item.substr(0, 1);
        }
        if ('Attachment' === sheetJsonData[item].v) {
          expectedKeys.Attachment = item.substr(0, 1);
        }
      });

      // console.log(expectedKeys)

      const usefulArr: Array<IUsefulItem> = [
        // {OrderNumber: "#2812", SKU: "CJJJJTCF00488-Heart-Blue box*1;@1", Attachment: "https://uploadery.s3.amazonaws.com/meta-charms/e49b772a-IMG_49911.jpg"}
      ];
      const startStrKeys = Object.entries(expectedKeys).map(([, v]) => v); // [ 'B', 'C', 'E', 'S' ]
      const extraKey = ['AttachmentType']; // 19-11-14 扩展字段
      let itemJson = {} as IUsefulItem;

      Object.keys(sheetJsonData).forEach((item, idx) => {
        if (
          startStrKeys.includes(item.substr(0, 1)) &&
          !Object.keys(expectedKeys).includes(sheetJsonData[item].v) // 去掉第一行标题
        ) {
          if (item.startsWith(expectedKeys.OrderNumber)) {
            itemJson.OrderNumber = sheetJsonData[item].v;
          }
          if (item.startsWith(expectedKeys.SKU)) {
            itemJson.SKU = sheetJsonData[item].v;
          }
          if (item.startsWith(expectedKeys.quantity)) {
            // 19-11-14
            itemJson.quantity = sheetJsonData[item].v;
          }
          if (item.startsWith(expectedKeys.Attachment)) {
            const [error, type, Attachment] = compatible_CJ_Uploadery(
              sheetJsonData[item].v,
              item,
            );
            itemJson.AttachmentType = type as EAttachmentType;
            itemJson.Attachment = Attachment;
          }

          if (
            Object.keys(itemJson).length ===
            startStrKeys.length + extraKey.length
          ) {
            // item 装满了，存一条数据
            usefulArr.push(itemJson);
            itemJson = {} as IUsefulItem;
          }
        }
      });

      // ---- 19-06-08 mod 支持多 SKU --S--
      let processedArr: Array<any> = [];

      usefulArr.forEach(row => {
        try {
          if (!row.Attachment) {
            // 跳过脏数据
            return;
          }
          let tmpArr = [];
          let skuArr = row.SKU.split(';');

          if (row.Attachment.length === 1) {
            // 单个 SKU
            tmpArr = [
              {
                ...row,
                SKU: row.SKU.split(';')[0],
                Attachment: row.Attachment[0],
              },
            ];
          } else {
            // 多个 SKU [拉平]
            tmpArr = row.Attachment.map((imgUrl: string, idx: number) => ({
              OrderNumber: `${row.OrderNumber}-${idx + 1}`,
              SKU: skuArr[idx],
              Attachment: imgUrl,
              group: row.OrderNumber,
            }));
          }

          processedArr = processedArr.concat(tmpArr);
        } catch (e) {
          console.error(
            `${JSON.stringify(row)}\nSKU加工失败，不会影响其他的图片下载`,
          );
        }
      });
      // ---- 19-06-08 mod 支持多 SKU --E--

      resolve([null, processedArr]);
    } catch (e) {
      resolve([e]);
      throw e;
    }
  });
}

// ---- 19-11-14 ---- add 兼容 cj、shopify-uploadery
export type IResult = [string | null, EAttachmentType, Array<string> | null];
function compatible_CJ_Uploadery(Attachment: string, point: string) {
  // [error, type, Attachment]
  let result: IResult = [null, '' as EAttachmentType, null] as IResult;

  // [key:value;key:value;]
  const isCj = /^\[((.|\n)+:(.|\n)+;)+\]$/.test(Attachment);

  try {
    if (isCj) {
      result[1] = EAttachmentType.cj;
      // 元数据 CJ
      // [_uploadery_1:https://uploadery.s3.amazonaws.com/meta-charms/b7e878ee-imagepng_0.png;]

      // BUG: 19-11-19 元数据 CJ [有换行]
      // [Texte personnalisé:One love, forever, Happy Birthday
      //  je t’aime Imane.;Image:https://uploadery.s3.amazonaws.com/giordini/efa759e1-EB9F1108-93E7-45B5-BB8E-BE9B8530A607.jpeg;]
      result[2] = Attachment.substring(1, Attachment.length - 1)
        .split(';')
        .map(_ => {
          if (_.includes('download.html')) {
            // 兼容 html 形式的链接 20-03-05
            // https://cdn.shopify.com/s/files/1/0033/4807/0511/files/download.html?id=610f9743-fad7-420f-bfa9-b483643e628d&uu=9ee77182-2429-4314-ad13-7d5919c07a09&mo=&fi=T0ZGSUNJQUwgMS5wbmc=&image=true
            const r = _.match(/(?<=(&uu=)).*(?=(&mo=))/);
            return Array.isArray(r)
              ? // 根据分析页面拼装出来的链接，貌似可用。愿万事大吉 ^_^
                `https://cdn.getuploadkit.com/${r[0]}/-/preview/900x900/OFFICIAL%201.png`
              : '';
          } else {
            // 图片链接
            const r = _.match(/https?:\/\/.+\.(png|jpe?g)/);
            return Array.isArray(r) ? r[0] : '';
          }
        })
        .filter(_ => _);
    } else {
      result[1] = EAttachmentType.uploadery;
      // 元数据 shopify
      // [{"thirdPardMessage":[{"name":"_uploadery_1","value":"https://uploadery.s3.amazonaws.com/meta-charms/f6de9657-aa6f2151ed151e9037f575519a6ad368.jpg"}],"type":1,"customMessgae":{"podType":1,"zone":{"front":{"showimgurl":"https://cc-west-usa.oss-us-west-1.aliyuncs.com/20190225/5392159987651.jpg","editimgurl":"https://cc-west-usa.oss-us-west-1.aliyuncs.com/20190225/2329113007948.png","podtype":"picandtext"}}}}]
      result[2] = JSON.parse(Attachment).map(
        (_: any) => _.thirdPardMessage[0].value,
      );
    }
  } catch (e) {
    result[0] = Attachment;
    console.groupCollapsed('Attachment解析报错');
    console.log(`Attachment [${point}]:`, Attachment);
    console.warn(e.stack);
    console.groupEnd();
  } finally {
    return result;
  }
}
