// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { ipcRenderer, contextBridge } = require('electron/renderer');

contextBridge.exposeInMainWorld('gallery', {
  getImages() {
    return ipcRenderer.invoke('getImages');
  },
  importImages() {
    return ipcRenderer.invoke('importImages');
  },
  exportImages(selection) {
    ipcRenderer.send('exportImages', selection);
  },
  getNewImages(callback) {
    ipcRenderer.on('newImages', (event, images) => callback(images));
  },
  selectImages(selection) {
    ipcRenderer.send('selectImages', selection);
  },
  showModal(path) {
    ipcRenderer.send('showModal', path);
  }
});
