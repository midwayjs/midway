import * as assert from 'assert';
import * as path from 'path';

import { mm } from '../src';

import { BaseService } from './fixtures/base-app-decorator/src/lib/service';


const fixtures = path.join(__dirname, 'fixtures');

describe('test/mock_container.test.ts', () => {

  describe('test base app decorator', () => {
    let container;
    before(() => {
      container = mm.container({
        baseDir: path.join(fixtures, 'base-app-decorator'),
        typescript: true,
      });
    });
    afterEach(mm.restore);

    it('should mock service success', async () => {
      const service = await container.getAsync(BaseService);
      mm.default(service, 'getData', async (name) => {
        return new Promise((resolve) => {
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
