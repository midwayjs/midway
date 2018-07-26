import {BaseService} from './fixtures/base-app-decorator/src/lib/service';

const path = require('path');
const assert = require('assert');
const mm = require('../src');
const fixtures = path.join(__dirname, 'fixtures');

describe('test/mock_container.test.ts', () => {

  let container;
  before(() => {
    container = mm.container({
      baseDir: path.join(fixtures, 'base-app-decorator'),
      typescript: true,
    });
    return container.ready();
  });
  after(() => container.stop());
  afterEach(mm.restore);

  it('should mock service success', async () => {
    const service = await container.getAsync(BaseService);
    assert(service.getData(), 100);
  });
});
