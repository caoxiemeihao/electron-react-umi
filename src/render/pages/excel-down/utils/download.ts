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
    const stream = fs.createWriteStream(filename);

    (url.startsWith('https') ? https : http)
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
              stream.close();
              events.emit(DOWNLOAD_EVENT, [FLAG.err, url, err]);
            })
            .on('end', () => {
              // subject.next([FLAG.end, url, url]);
              // subject.complete();
              stream.close();
              events.emit(DOWNLOAD_EVENT, [FLAG.end, url, url]);
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
        stream.close();
        events.emit(DOWNLOAD_EVENT, [FLAG.error, url, err]);
      })
      .on('response', status => {
        if (status.statusCode !== 200) {
          // subject.next([FLAG['!response200'], url, status]);
          // subject.complete();
          stream.close();
          events.emit(DOWNLOAD_EVENT, [FLAG['!response200'], url, status]);
        } else {
          // subject.next([FLAG.response200, url, status]);
          events.emit(DOWNLOAD_EVENT, [FLAG.response200, url, status]);
        }
      });
  }

  // return subject;
}
