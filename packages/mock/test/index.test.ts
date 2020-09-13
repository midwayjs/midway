import * as path from 'path';

const fixtures = path.join(__dirname, 'fixtures');
// app dir
process.env.MIDWAY_BASE_DIR = path.join(fixtures, 'base-app-decorator');

import { app, mm } from '../bootstrap';

const assert = require('assert');
import { mm as mock, MockContainer } from '../src/';

describe.skip('test/index.test.ts', () => {
  afterEach(mm.restore);

  it('should app has mockClassFunction', async () => {
    assert.ok(app.mockClassFunction && typeof app.mockClassFunction === 'function');
    const ts = Date.now();
    app.mockClassFunction('baseService', 'getData', () => {
      return 'mock_test' + ts;
    });
    const service: any = await app.applicationContext.getAsync('baseService');
    assert(service.getData() === ('mock_test' + ts));

    mm.restore();
    assert(service.getData() !== ('mock_test' + ts));
    const service1: any = await app.applicationContext.getAsync('baseService');
    assert(service1.getData() !== ('mock_test' + ts));
  });

  it('should use bootstrap to get app', () => {
    return app.httpRequest()
      .get('/api/index')
      .expect(200);
  });

  it('should mm function be ok', async () => {
    const service: any = await app.applicationContext.getAsync('baseService');
    const ts = Date.now();
    mm(service, 'getData', () => {
      return 'hello' + ts;
    });

    assert(service.getData() === 'hello' + ts);
    mm.restore();

    assert(service.getData() !== 'hello' + ts);
  });

  it('should use mm.app to get app', async () => {
    const app = mock.app({
      baseDir: process.env.MIDWAY_BASE_DIR,
      framework: process.env.MIDWAY_FRAMEWORK_PATH,
    });
    await app.ready();
    assert(app.mockContext().requestContext);
    assert.ok(app.mockClassFunction && typeof app.mockClassFunction === 'function');
    await app.close();
  });

  it('should use mm.cluster to get app by default options', () => {
    mm(process.env, 'MIDWAY_FRAMEWORK_PATH', path.join(__dirname, '../../midway'));
    const app = mock.cluster({});
    return app.ready();
  });

  it('should use mm.cluster to get app', () => {
    const app = mock.cluster({
      baseDir: process.env.MIDWAY_BASE_DIR,
      framework: process.env.MIDWAY_FRAMEWORK_PATH,
    });
    return app.ready();
  });

  it('should init container from app', async () => {
    const app = new MockContainer({
      baseDir: process.env.MIDWAY_BASE_DIR,
      framework: process.env.MIDWAY_FRAMEWORK_PATH,
    });
    return app.ready();
  });
});
