# Electron Exercises

## Ex1: Create a new project

Clone this repository

Install electron with npm or yarn

Create a npm start script that will run the `src/index.js` with electron

Launch the start script


## Ex2: User Data

We would like to create a `img` folder in the user data directory of the app and get the images pathes.

In the main process, edit the `initImages` function. Use `app.getAppPath()` and the Node.js `path` module to get absolute path of the `img` within this repository.

Using `fs.access` check if an `img` folder exists in the userData folder (use `app.getPath` to get the userData data). `fs.access` will throw an Error with code `ENOENT` if the specified path doesn't exist.

If `img` doesn't exist in `userData`, create it using `fs.cp` with the `recursive` option.

We call this function inside the `createWindow` function so each time a main window is created we ensure the userData `img` folder exist.


## Ex3: App Communication and preload

In `src/main.js` we have 3 functions that need to be implemented :

- `getImages`
- `importImages`
- `exportImages`

In the `getImages` you will return the absolute pathes of the images inside this `img` folder using `fs.readdir`

We will use `importImages` and `exportImages` in the next exercise about dialogs.

In the preload script, create a gallery object using `contextBridge`, this object will have 3 methods :

- `getImages`
- `importImages`
- `exportImages`

`getImages` doesn't take params, it should call `getImages` in the main process throught `ipcRenderer` and return the result to the renderer process (two ways communication)

`importImages` doesn't take params, it should call the `importImages` from the main process and return the result to the renderer process (two ways communication)

`exportImages` takes a selection as param, it should call the `exportImages` from the main process but doesn't expect any return (one way communication)

## Ex4: Dialogs

Complete the `importImages` function from the main process so it will open an openDialog with title `Import Images`, button `Import`. We should only be able to select `.png`, `.jpg`, `.jpeg`, `.webp` files. We should be able to select multiple image at once.

```js
async function importImages() {
  const userDataPath = app.getPath('userData');
  const imgUserDataPath = path.resolve(userDataPath, 'img');

  const returnValue = await dialog.showOpenDialog(mainWindow, {
    /* ... */
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
```

Install the `sharp` npm package.

`sharp` is a native module so you might need to rebuild it for electron using this command : `npx electron-rebuild sharp`

Complete the `exportImages` function from the main process so it shows, an open dialog that allows us to select a folder where images will be exported in the `.webp` format.

Call `dialog.showMessageBox` on success, `dialog.showErrorBox` on error.

```js
async function exportImages(event, selection) {
  const returnValue = await dialog.showOpenDialog(mainWindow, {
    /* ... */
  });

  try {
    if (returnValue.filePaths[0]) {
      for (const image of selection) {
        const name = path.parse(image).name;
        const dest = path.resolve(returnValue.filePaths[0], `${name}.webp`)

        await sharp(image).toFile(dest);
      }
    }

    /* ... */
  }
  catch (err) {
    /* ... */
  }
}
```

## Ex5: Menus

In the File Menu insert the following items :

- `Import Images`
- `Export Selection in WebP` 

`Import Images` can call the `importImages` function but will have to notify the renderer process that new images are available. Use main to renderer communication with the preload script.

`Export Selection in WebP` should only be available when a selection is made in the renderer process so you will have to do renderer to main communication with the preload script to enable/disable the menu. 

When we click on the menu we will have to call the `exportImages` function with the selection coming from the renderer process.

## Ex6: Multiple windows

In the renderer process listen to the `dblclick` DOM event on images.

When the double click occurs, show the image in a separate browser window with the modal option.

You will have to create a communication between the two renderer processes to display the right image. This communication will have to go through the main process.

When we click on that modal it should hide.

## Ex7: Packaging

Follow the quick setup guide on electron-builder to create a package of the app on you platform :
[https://www.electron.build/#quick-setup-guide]()

Use the `icon.png` in this repository as the App Icon.