const { app, BrowserWindow, ipcMain, dialog, Menu, MenuItem } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');

/** @type {BrowserWindow} */
let mainWindow;

/** @type {BrowserWindow} */
let childWindow;

let selection = [];

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

async function importImages() {
  const userDataPath = app.getPath('userData');
  const imgUserDataPath = path.resolve(userDataPath, 'img');

  const returnValue = await dialog.showOpenDialog(mainWindow, {
    title: 'Import images',
    message: 'Select images to import',
    buttonLabel: 'Import',
    filters: [
      {
        name: 'Images',
        extensions: ['jpg', 'jpeg', 'png', 'webp'],
      },
    ],
    properties: ['openFile', 'multiSelections'],
  });

  const newFiles = [];

  for (const image of returnValue.filePaths) {
    const basename = path.basename(image);
    const dest = path.resolve(imgUserDataPath, basename);
    await fs.copyFile(image, dest);

    newFiles.push(dest);
  }

  return newFiles;
}

async function exportImages(event, selection) {
  const returnValue = await dialog.showOpenDialog(mainWindow, {
    title: 'Export images to WebP',
    message: 'Select folder to export you images',
    buttonLabel: 'Export',
    properties: ['openDirectory', 'createDirectory'],
  });

  if (returnValue.filePaths[0]) {
    for (const image of selection) {
      const name = path.parse(image).name;
      const dest = path.resolve(returnValue.filePaths[0], `${name}.webp`);

      await sharp(image).toFile(dest);
    }
  }

  await dialog.showMessageBox(mainWindow, {
    title: 'Success',
    type: 'info',
    message: 'Export completed',
    buttons: ['OK'],
  });
}

function selectImages(event, selectionFromRenderer) {
  selection = selectionFromRenderer;
  const menu = Menu.getApplicationMenu();
  const exportMenuItem = menu.getMenuItemById('export_selection');

  exportMenuItem.enabled = Boolean(selection.length);
}

function showModal(event, image) {
  childWindow.webContents.send('displayImage', image);
  childWindow.show();
}

function closeModal() {
  childWindow.hide();
}

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

  childWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    width: 640,
    height: 480,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'show-image-preload.js'),
    },
  });

  childWindow.loadFile(path.join(__dirname, 'show-image.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  const menu = Menu.getApplicationMenu();
  const fileSubMenu = menu.items.find((item) => item.role === 'filemenu').submenu;

  const importMenuItem = new MenuItem({
    label: 'Import Images',
    accelerator: 'CommandOrControl+I',
    async click() {
      const images = await importImages();
      mainWindow.webContents.send('newImages', images);
    },
  });
  fileSubMenu.insert(0, importMenuItem);

  const exportMenuItem = new MenuItem({
    id: 'export_selection',
    label: 'Export Selection to WebP',
    accelerator: 'CommandOrControl+E',
    enabled: false,
    async click() {
      await exportImages({}, selection);
    },
  });
  fileSubMenu.insert(1, exportMenuItem);

  Menu.setApplicationMenu(menu);
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
ipcMain.on('selectImages', selectImages);
ipcMain.on('showModal', showModal);
ipcMain.on('closeModal', closeModal);
