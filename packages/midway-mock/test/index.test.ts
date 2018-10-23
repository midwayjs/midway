import * as path from 'path';
const fixtures = path.join(__dirname, 'fixtures');
// app dir
process.env.MIDWAY_BASE_DIR = path.join(fixtures, 'base-app-decorator');
// midway dir
process.env.MIDWAY_FRAMEWORK_PATH = path.join(__dirname, '../../midway');

import { app, mm } from '../bootstrap';
const assert = require('assert');

describe('test/index.test.ts', () => {
  afterEach(mm.restore);

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
});
