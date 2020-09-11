
const { app, BrowserWindow, Tray, Menu, ipcMain, } = require('electron');
const AutoLaunch = require('auto-launch');
const path = require('path');
const isdev = require('electron-is-dev')
let TrayWindow;
let tray; 
require("update-electron-app")({
  repo: "achuthhadnoor/battery_notifier",
  updateInterval: "1 hour"
});
require('events').EventEmitter.prototype._maxListeners = 100;
const AutoLaunchApp = new AutoLaunch({
  name: 'Battery Notifier'
});

if (app.dock) {
  app.dock.hide()
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}
else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (TrayWindow) {
      if (TrayWindow.isMinimized()) TrayWindow.restore()
      TrayWindow.focus()
    }
  })

  const createWindow = () => {
    let icon = path.join(__dirname, 'captur.png')
    tray = new Tray(icon)

    // Create the browser window.
    TrayWindow = new BrowserWindow({
      width: 250,
      height: 100,
      alwaysOnTop: true,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      useContentSize: true,
      webPreferences: {
        nodeIntegration: true,
        devTools: isdev ? true : false
      }
    });

    // and load the index.html of the app.
    TrayWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    // TrayWindow.webContents.openDevTools();

    tray.on('click', () => toggleWindow());
    tray.setToolTip("Captur")
    // let autoLaunch = store.get('autolaunch');
    // if (!autoLaunch) {
    // autoLaunch = store.set('autolaunch', true);
    AutoLaunchApp.enable()
    // }

    const contextMenu = Menu.buildFromTemplate([
      // {
      //   label: 'Auto Launch', type: 'checkbox', checked: autoLaunch ? true : false, click: () => {
      //     if (autoLaunch) {
      //       AutoLaunchApp.disable();
      //       return store.delete('autolaunch');
      //     }
      //     AutoLaunchApp.enable();
      //     return store.set('autolaunch', true);
      //   }
      // },
      { role: 'quit' }
    ])

    tray.setContextMenu(contextMenu);

  };

  const toggleWindow = () => {
    if (TrayWindow.isVisible()) {
      TrayWindow.hide();
    } else {
      TrayWindow.show();
    }
  }

  app.on('ready', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
    // globalShortcut();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}