const got = require('got');
const https = require('https');
const fs = require('fs');
const path = require('path');

const url =
  'https://uploadery.s3.amazonaws.com/meta-charms/6c8c9f83-IMG_20190208_183646.jpg';
const 草莓 =
  'https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1590826381&di=89d9cfba552fbbf354e3fb034c403a4a&src=http://a2.att.hudong.com/36/48/19300001357258133412489354717.jpg';

const res = got(url);

// res.json().then((...args) => {
//   console.log(args)
// })

const handle = https.get(草莓, req => {
  // console.log(req)
  req.on('data', chunk => {
    console.log(chunk);
    fs.appendFile(path.join(__dirname, '草莓.jpg'), chunk, err => {
      console.log(err);
    });
  });
  req.on('end', () => {
    console.log('下载完成');
    handle.end();
  });
});
