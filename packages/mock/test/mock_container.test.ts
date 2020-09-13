import { BaseService } from './fixtures/base-app-decorator/src/lib/service';
import { mm } from '../src';

import * as path from 'path';
const assert = require('assert');
const fixtures = path.join(__dirname, 'fixtures');

describe.skip('test/mock_container.test.ts', () => {

  describe('test base app decorator', () => {
    let container;
    beforeAll(() => {
      container = mm.container({
        baseDir: path.join(fixtures, 'base-app-decorator'),
        typescript: true
      });
    });
    afterEach(mm.restore);

    it('should mock service success', async () => {
      const service = await container.getAsync(BaseService);
      mm.default(service, 'getData', async name => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(`hello ${name}`);
          }, 100);
        });
      });

      assert(await service.getData('nihao') === 'hello nihao');
      mm.restore();

      assert(service.getData() === 't10');
    });
  });

});
