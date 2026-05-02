const { join } = require('path');
const {
  close,
  createApp,
  createLightApp,
  createHttpRequest,
} = require('../../../mock/src');

const fixtureName = process.argv[2];
process.env.MIKRO7_FIXTURES_DIR = __dirname;

(async () => {
  if (fixtureName === 'base') {
    const app = await createLightApp(join(__dirname, 'base-fn-origin'), {
      moduleLoadType: 'esm',
    });
    const result = app.getAttr('result');
    await close(app);
    process.send?.({ result });
    return;
  }

  if (fixtureName === 'multi') {
    const app = await createApp(join(__dirname, 'multi-enitymanager'), {
      moduleLoadType: 'esm',
    });
    const m1 = await createHttpRequest(app).get('/m1').expect(200);
    const withEntity = await createHttpRequest(app)
      .get('/m1/withEntity')
      .expect(200);
    const home = await createHttpRequest(app).get('/').expect(200);
    await close(app);
    process.send?.({
      result: {
        m1: m1.text,
        withEntity: withEntity.text,
        home: home.text,
      },
    });
    return;
  }

  throw new Error(`Unknown fixture: ${fixtureName}`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
