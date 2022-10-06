// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { ipcRenderer, contextBridge } = require('electron/renderer');

contextBridge.exposeInMainWorld('gallery', {
  displayImage(callback) {
    ipcRenderer.on('displayImage', (event, image) => callback(image));
  },
  closeModal() {
    ipcRenderer.send('closeModal');
  },
});
