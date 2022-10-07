const { test, _electron: electron, expect } = require('@playwright/test');
const fs = require('fs/promises');
const path = require('path');

test.beforeEach(async () => {
  const app = await electron.launch({ args: ['.'] });
  const userData = await app.evaluate(({ app }) => {
    return app.getPath('userData');
  });
  await fs.rm(path.resolve(userData, 'img'), {force: true, recursive: true});

  await app.close();
})

test('images should at startup', async () => {
  const app = await electron.launch({ args: ['.'] });

  const page = await app.firstWindow();
  
  await page.waitForSelector('.gallery img');

  page.on('console', console.log);

  const imagesCount = await page.evaluate(() => {
    return document.body.querySelectorAll('.gallery img').length;
  });

  expect(imagesCount).toBe(4);
  

  // page.on('console', console.log);
  // const images = await page.evaluate(
  //   ([body]) => {
  //     console.log(body.innerHTML);
  //     return body.querySelectorAll('.gallery img');
  //   },
  //   [bodyHandle],
  // );
  // await bodyHandle.dispose();

  // expect(images.length).toBe(4);
});

test('select images', async () => {
  const app = await electron.launch({ args: ['.'] });
  const page = await app.firstWindow();

  await page.waitForSelector('.gallery img');

  await page.click('.gallery img:nth-child(2)');

  await app.evaluate(({ dialog }) => {
    dialog.showOpenDialog = () => Promise.resolve({ cancelled: true, files: [] });
  })

  await page.click('.import-button');

  await page.pause();
})