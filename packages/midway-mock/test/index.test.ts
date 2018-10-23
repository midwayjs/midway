import * as path from 'path';
const fixtures = path.join(__dirname, 'fixtures');
// app dir
process.env.MIDWAY_BASE_DIR = path.join(fixtures, 'base-app-decorator');
// midway dir
process.env.MIDWAY_FRAMEWORK_PATH = path.join(__dirname, '../../midway');

import { app, mm } from '../bootstrap';
import { mm as mock, MockContainer } from '../src/';

describe('test/index.test.ts', () => {
  afterEach(mm.restore);

  it('should use bootstrap to get app', () => {
    return app.httpRequest()
      .get('/api/index')
      .expect(200);
  });

  it('should use mm.cluster to get app', () => {
    const app = mock.app({
      baseDir: process.env.MIDWAY_BASE_DIR,
      framework: process.env.MIDWAY_FRAMEWORK_PATH,
    });
    return app.ready();
  });

  it('should use mm.cluster to get app', () => {
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

  it('should use mm.cluster to get app', async () => {
    const app = new MockContainer({
      baseDir: process.env.MIDWAY_BASE_DIR,
      framework: process.env.MIDWAY_FRAMEWORK_PATH,
    });
    return app.ready();
  });
});
