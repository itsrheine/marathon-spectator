const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 780,
    resizable: true,
    autoHideMenuBar: true
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(createWindow);