/**
 * 图片下载
 */
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import * as rxjs from 'rxjs';
import { EventEmitter } from 'events';

export type DOWNLOAD_ARGS = [FLAG, string, any];
export const DOWNLOAD_EVENT = 'DOWNLOAD_EVENT';
export const events = new EventEmitter();

export interface IProps {
  /** 图片地址 */
  url: string;
  /** 下载目标地址 */
  filename: string;
}

export enum FLAG {
  /** 入参错误 */
  params = 'params',
  /** response.err */
  err = 'err',
  /** http.get.err */
  error = 'error',
  /** 返回数据 ing... */
  data = 'data',
  /** 返回数据结束 */
  end = 'end',
  /** 返回 !== 200 */
  '!response200' = '!response200',
  response200 = 'response200',
}

/** WriteStream、ClientRequest、URL */
let downHandles: Array<[fs.WriteStream, http.ClientRequest, string]> = [];
const filterHandles = (url: string) => {
  const item = downHandles.find(([, , _url]) => _url === url);
  if (item) {
    item[0].end();
    item[0].destroy();
    item[1].abort();
  }
  downHandles = downHandles.filter(([, , _url]) => _url !== url);
};

/**
 * ps: rx 用起来好吃力，乱用 ing... 😥
 */
export function download({ url, filename }: IProps) {
  // const subject = new rxjs.Subject<[FLAG, string, any]>();

  if (typeof url !== 'string' || typeof filename !== 'string') {
    // subject.next([FLAG.params, url, '入参错误']);
    // subject.complete();
    events.emit(DOWNLOAD_EVENT, [FLAG.params, url, '入参错误']);
  } else {
    // 重复下载、把前面的关闭
    const item = downHandles.filter(([, , _url]) => _url === url);
    if (item[0]) {
      filterHandles(url);
    }

    const stream = fs.createWriteStream(filename);
    const handle = (url.startsWith('https') ? https : http)
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
          },
        },
        res => {
          res
            .on('error', err => {
              // subject.next([FLAG.err, url, err]);
              // subject.complete();
              events.emit(DOWNLOAD_EVENT, [FLAG.err, url, err]);
              filterHandles(url);
            })
            .on('end', () => {
              // subject.next([FLAG.end, url, url]);
              // subject.complete();
              events.emit(DOWNLOAD_EVENT, [FLAG.end, url, url]);
              filterHandles(url);
            })
            .on('data', chunk => {
              stream.write(chunk);
              // subject.next([FLAG.data, url, chunk]);
              events.emit(DOWNLOAD_EVENT, [FLAG.data, url, chunk]);
            });
        },
      )
      .on('error', err => {
        // subject.next([FLAG.error, url, err]);
        events.emit(DOWNLOAD_EVENT, [FLAG.error, url, err]);
        filterHandles(url);
      })
      .on('response', status => {
        if (status.statusCode !== 200) {
          // subject.next([FLAG['!response200'], url, status]);
          // subject.complete();
          events.emit(DOWNLOAD_EVENT, [FLAG['!response200'], url, status]);
          filterHandles(url);
        } else {
          // subject.next([FLAG.response200, url, status]);
          events.emit(DOWNLOAD_EVENT, [FLAG.response200, url, status]);
        }
      });

    downHandles.push([stream, handle, url]);
  }

  // return subject;
}
