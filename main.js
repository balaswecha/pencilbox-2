'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  var displays = electron.screen.getAllDisplays()[0].workAreaSize;

  // mainWindow = new BrowserWindow({width: 1024, height: 768});
  mainWindow = new BrowserWindow({width: displays.width, height: displays.height});

  // and load the index.html of the app.
  if(process.argv[2]=='physics'){
    mainWindow.loadURL('file://' + __dirname + '/app/index.html#/AllAppsView/physics/subsections');
  }
  else if(process.argv[2]=='mathematics'){
    mainWindow.loadURL('file://' + __dirname + '/app/index.html#/AllAppsView/mathematics');
  }
  else if(process.argv[2]=='chemistry'){
    mainWindow.loadURL('file://' + __dirname + '/app/index.html#/AllAppsView/chemistry');
  }
  else if(process.argv[2]=='biology'){
    mainWindow.loadURL('file://' + __dirname + '/app/index.html#/AllAppsView/biology');
  }
  else if(process.argv[2]=='english'){
    mainWindow.loadURL('file://' + __dirname + '/app/index.html#/AllAppsView/english');
  }
  else if(process.argv[2]=='social'){
    mainWindow.loadURL('file://' + __dirname + '/app/index.html#/AllAppsView/social');
  }
  else
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
