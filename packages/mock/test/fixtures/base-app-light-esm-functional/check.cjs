const { createLightApp, close } = require('../../../src');

(async () => {
  const app = await createLightApp(__dirname, {
    moduleLoadType: 'esm',
  });
  const appContext = app.getApplicationContext();
  const userController = await appContext.getAsync('userController');

  if (appContext.getObject('fixtureName') !== 'esm-functional') {
    throw new Error('fixtureName was not loaded from configuration.ts');
  }

  if (userController.show() !== 'hello world') {
    throw new Error('userController did not resolve injected service');
  }

  await close(app);
  process.send?.('ready');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
