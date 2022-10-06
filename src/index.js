const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow;

async function initImages() {
  const appPath = app.getAppPath();
  const userDataPath = app.getPath('userData');

  const imgDemoFolderPath = path.resolve(appPath, 'img');
  const imgUserDataPath = path.resolve(userDataPath, 'img');

  try {
    await fs.access(imgUserDataPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.cp(imgDemoFolderPath, imgUserDataPath, { recursive: true });
    }
  }
}

async function getImages() {
  const userDataPath = app.getPath('userData');
  const imgUserDataPath = path.resolve(userDataPath, 'img');

  const files = await fs.readdir(imgUserDataPath);

  return files.map((file) => path.resolve(imgUserDataPath, file));
}

async function importImages() {}

async function exportImages(event, selection) {}

const createWindow = async () => {
  await initImages();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.handle('getImages', getImages);
ipcMain.handle('importImages', importImages);
ipcMain.on('exportImages', exportImages);
