const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const url =
  'https://uploadery.s3.amazonaws.com/giordini/7fee4de6-CFDA7A72-C9A7-4FD7-A645-A9F111380735.jpeg';
const url2 =
  'https://t8.baidu.com/it/u=1484500186,1503043093&fm=79&app=86&size=h300&n=0&g=4n&f=jpeg?sec=1591513264&t=a3abc58b545540f993078b936263227a';
const options = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
  },
};

const stream = new fs.WriteStream(path.join(__dirname, '狮子.jpeg'));

https
  .get(url2, options, res => {
    res
      .on('end', () => {
        console.log('end');
      })
      .on('error', err => {
        console.log('res.error', err);
      })
      .on('data', chunk => {
        stream.write(chunk, err => {
          console.log('write -> err', err);
        });
      });
  })
  .on('finish', () => {
    console.log('finish');
  })
  .on('error', (...args) => {
    console.log('error', args);
  })
  .on('response', res => {
    console.log('----', res.statusCode);
  });

/*
$ node test/http.js
finish
---- 200
write -> err undefined
write -> err undefined
end
write -> err undefined
 */
