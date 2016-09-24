'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  //Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (shouldQuit) {
  app.quit();
  return;
}

function createWindow () {
  // Create the browser window.
  var displays = electron.screen.getAllDisplays()[0].workAreaSize;

  // mainWindow = new BrowserWindow({width: 1024, height: 768});
  mainWindow = new BrowserWindow({width: displays.width, height: displays.height});

  // and load the index.html of the app.
  if(process.argv[2]=='10'){
    mainWindow.loadURL('file://' + __dirname + '/app/index.html#/grades/10');
  }
  else if(process.argv[2]=='9'){
    mainWindow.loadURL('file://' + __dirname + '/app/index.html#/grades/9');
  }
  else if(process.argv[2]=='8'){
    mainWindow.loadURL('file://' + __dirname + '/app/index.html#/grades/8');
  }
  else if(process.argv[2]=='7'){
    mainWindow.loadURL('file://' + __dirname + '/app/index.html#/grades/7');
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
