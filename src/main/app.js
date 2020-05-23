/**
 * 主进程入口文件
 */
const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev');
require('dotenv').config();

let win = null;

function createw_indow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    x: isDev ? 0 : undefined,
    y: isDev ? 0 : undefined,
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const URL = isDev
    ? `http://localhost:${process.env.PORT}`
    : `file://${path.join(__dirname, '../render/dist/index.html')}`;

  win.loadURL(URL);
}

// 切换 DevTools
function toggleDevTools(bool) {
  if (win) {
    if (bool !== undefined) {
      bool ? win.webContents.openDevTools() : win.webContents.closeDevTools();
    } else {
      win.webContents.toggleDevTools();
    }
  }
}

// 选择 xlsx 图片下载位置
function chooseDownloadPath(sender) {
  dialog
    .showOpenDialog(win, {
      properties: ['openDirectory'], // 只显示文件夹
    })
    .then(({ canceled, filePaths }) => {
      if (!canceled) {
        sender.send('choosed-download-path', filePaths[0]);
      }
    })
    .catch(err => {
      // dialog.showErrorBox('选择 xlsx 图片下载位置', err);
      console.log(err);
    });
}

ipcMain.on('toggle-devtools', (event, bool) => toggleDevTools(bool));
ipcMain.on('open-choose-download-path', event =>
  chooseDownloadPath(event.sender),
);

app.whenReady().then(createw_indow);
